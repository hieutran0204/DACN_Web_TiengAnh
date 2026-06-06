/**
 * services/ai/scoring.engine.js
 *
 * Node 1 — Deterministic IELTS Scoring Engine (Dual-Node Architecture)
 *
 * Computes and LOCKS all four IELTS band scores algorithmically from the
 * Feature Map, Hard Caps (BandConstraintEngine), and Graph Engine results.
 * Zero LLM calls. 100% reproducible given the same inputs.
 *
 * Design rationale:
 *   The previous mega-prompt asked the LLM to simultaneously score, enforce
 *   Hard Caps, and generate feedback. LLMs have a strong prior:
 *   "fluent language surface → high score", which overrides hard numerical
 *   constraints in instruction text (compliance ~35%).
 *
 *   By locking scores HERE (deterministically) before any LLM call,
 *   the Feedback Generator (Node 2) receives pre-filled scores it cannot
 *   change, eliminating the prior conflict entirely.
 *
 * Calibration note:
 *   Thresholds are anchored to Cambridge IELTS Band Descriptors (Band 5–8).
 *   Run scripts/eval-judge.js against a scored essay set to validate and
 *   adjust after initial deployment.
 */

// ─── IELTS Rounding Helpers ────────────────────────────────────────────────────

/**
 * Round a raw computed score to the nearest valid IELTS band step (0.5),
 * clamped to the valid band range [1.0, 9.0].
 *
 * @param {number} score
 * @returns {number}
 */
const roundBand = (score) => {
  const clamped = Math.max(1.0, Math.min(9.0, score));
  return Math.round(clamped * 2) / 2;
};

/**
 * Cambridge standard Overall Band rounding rule.
 * Average of four criteria, then:
 *   fraction >= 0.75 → round up to next whole band
 *   fraction >= 0.25 → round up to .5
 *   else             → round down to whole band
 *
 * @param {number} tr
 * @param {number} cc
 * @param {number} lr
 * @param {number} gra
 * @returns {number}
 */
const calculateOverall = (tr, cc, lr, gra) => {
  const average  = (tr + cc + lr + gra) / 4;
  const intPart  = Math.floor(average);
  const fraction = average - intPart;
  if (fraction >= 0.75) return intPart + 1.0;
  if (fraction >= 0.25) return intPart + 0.5;
  return intPart + 0.0;
};

// ─── Scoring Engine ────────────────────────────────────────────────────────────

class ScoringEngine {

  // ── GRA ────────────────────────────────────────────────────────────────────

  /**
   * Compute GRA (Grammatical Range & Accuracy) band score.
   *
   * Two-axis model aligned with Cambridge rubric:
   *   Axis 1 — ACCURACY:  Error rate (errors per 100 words) → base score.
   *   Axis 2 — RANGE:     Structural diversity (complex ratio, advanced structures) → bonus/penalty.
   *   Axis 3 — CONTROL:   Fragment rate (independent of diversity) → additional penalty.
   *
   * @param {Object} featureMap
   * @param {Object} hardCaps
   * @returns {{ score: number, reasons: string[] }}
   */
  _computeGRA(featureMap, hardCaps) {
    const reasons   = [];
    const grammar   = featureMap.grammar         || {};
    const structure = featureMap.sentence_structure || {};

    // ── GRA Fix (2026-06-03): Prefer LanguageTool over Small LLM ────────────
    // Root cause of GRA MAE=1.05: Small LLM (Ollama) has ~50% grammar error
    // recall → errorRate is systematically under-counted → GRA base inflated.
    // LanguageTool is rule-based with ~90% recall. When Python bridge delivers
    // grammar_errors.error_per_100_words (from LanguageTool), we use it.
    // Fallback: LLM-counted errorRate from featureMap.grammar (legacy path).
    const ltErrorRate  = grammar.language_tool_error_rate ?? null;
    const ltMajorCount = grammar.language_tool_major_count ?? 0;
    const ltAvailable  = grammar.language_tool_available === true;
    const errorRate    = ltAvailable && ltErrorRate !== null
      ? ltErrorRate
      : (grammar.error_per_100_words || 0);
    if (ltAvailable) {
      reasons.push(`GRA Source: LanguageTool (deterministic, ~90% recall). error_rate=${errorRate.toFixed(2)}/100w, major_errors=${ltMajorCount}`);
    } else {
      reasons.push(`GRA Source: Small LLM fallback (LanguageTool unavailable). error_rate=${errorRate.toFixed(2)}/100w`);
    }

    // ── spaCy advanced structures: prefer doc-level variety set if available ─
    // Python bridge now provides doc_advanced_structure_count = len(set) of
    // distinct structure types (passive_voice, relative_clause, conditional…).
    // This replaces regex-based pattern count from FeatureBuilder.
    const totalSents   = structure.total_sentences   || 0;
    const fragmentRate = totalSents > 0
      ? (structure.fragments || 0) / totalSents : 0;
    const complexRatio = totalSents > 0
      ? (structure.complex  || 0) / totalSents : 0;
    // advanced_structure_types = distinct pattern categories (Set.size) — measures VARIETY for range bonus.
    // Prefers spaCy dependency-parsed count (grammar.spacy_structure_count) when available.
    // Falls back to regex-based count from FeatureBuilder for backwards compatibility.
    const advStructs = grammar.spacy_structure_count
      ?? structure.advanced_structure_types
      ?? structure.advanced_structure_count
      ?? 0;

    // ── Step 1: Base score from Accuracy ─────────────────────────────────
    // Cambridge Band 4: "attempts a limited range, mostly erroneous, causes difficulty"
    // Cambridge Band 5: "uses only a limited range, frequent grammatical errors"
    // Cambridge Band 7: "uses a variety of complex structures with some flexibility and accuracy"
    // Cambridge Band 8: "uses a wide range of structures with full flexibility and accuracy"
    //
    // RECALIBRATION (2026-06-03, from eval_results.json Group A analysis):
    //   Root cause of GRA over-scoring: errorRate < 1.0 → base 7.0 was too lenient.
    //   Pattern observed: GT_002 (human GRA=6.5) → predicted 8.0; GT_008 (human 5.0) → 6.5.
    //   Essays with 0.5-1.0 errors/100w have good accuracy, but Cambridge Band 7 additionally
    //   requires "flexibility" — not just low error rate. Tightened thresholds below:
    //     errorRate < 0.5 (near-perfect) → Band 7 baseline (was < 1.0)
    //     errorRate 0.5-1.5 (very good)  → Band 6.5 baseline (was 1.0-2.5 at 6.5)
    //     errorRate 1.5-3.0 (good)       → Band 6.0 (was 2.5-5.0)
    let base;
    if (errorRate === 0) {
      base = 8.0;
      reasons.push(`GRA Accuracy: Zero errors — Band 8 precision baseline (8.0)`);
    } else if (errorRate < 0.5) {
      base = 7.0;
      reasons.push(`GRA Accuracy: Near-perfect error rate (${errorRate.toFixed(2)}/100w < 0.5) — Band 7 baseline`);
    } else if (errorRate < 1.5) {
      base = 6.5;
      reasons.push(`GRA Accuracy: Very low error rate (${errorRate.toFixed(2)}/100w in 0.5-1.5) — Band 6.5 baseline`);
    } else if (errorRate < 3.0) {
      base = 6.0;
      reasons.push(`GRA Accuracy: Low-moderate errors (${errorRate.toFixed(2)}/100w in 1.5-3.0) — Band 6 baseline`);
    } else if (errorRate < 5.5) {
      base = 5.5;
      reasons.push(`GRA Accuracy: Some errors (${errorRate.toFixed(2)}/100w in 3.0-5.5) — Band 5.5 baseline`);
    } else if (errorRate < 8.5) {
      base = 5.0;
      reasons.push(`GRA Accuracy: Frequent errors (${errorRate.toFixed(2)}/100w in 5.5-8.5) — Band 5 baseline`);
    } else if (errorRate < 12.0) {
      base = 4.5;
      reasons.push(`GRA Accuracy: High error rate (${errorRate.toFixed(2)}/100w in 8.5-12.0) — Band 4.5 baseline`);
    } else {
      // Cambridge Band 4: "very limited range, mostly erroneous"
      base = 4.0;
      reasons.push(`GRA Accuracy: Very high error rate (${errorRate.toFixed(2)}/100w ≥ 12.0) — Band 4 baseline (Cambridge: mostly erroneous, causes difficulty for reader)`);
    }

    // ── Step 2: Range prerequisite check for Band 7+ (Cambridge rubric) ──
    // Cambridge Band 7 explicitly requires "a variety of complex structures".
    // Band 8 requires "a wide range of structures".
    // If accuracy earns a 7+ base but the essay lacks variety, downgrade base.
    // Note: BandConstraintEngine will further cap at 6.0 if complexRatio < 10%.
    if (base >= 8.0 && (complexRatio < 0.25 || advStructs < 3)) {
      base = 7.0;
      reasons.push(`GRA Range prerequisite: Band 8 requires wide variety. Essay has ${Math.round(complexRatio * 100)}% complex sentences and ${advStructs} advanced structures — base downgraded 8→7.`);
    } else if (base >= 7.0 && (complexRatio < 0.15 || advStructs < 2)) {
      base = 6.5;
      reasons.push(`GRA Range prerequisite: Band 7+ requires structural variety. Essay has ${Math.round(complexRatio * 100)}% complex sentences and ${advStructs} advanced structures — base downgraded to 6.5.`);
    }

    // ── Step 3: Range bonus/penalty from Structural Diversity ─────────────
    // RECALIBRATION (2026-06-03): Tightened bonus threshold from >=3 advStructs to >=4
    // to prevent giving +0.5 to essays with only 3 basic advanced structures.
    // Cambridge Band 7.5+ requires genuine flexibility, not just some complex structures.
    let rangeBonus = 0;
    if (complexRatio >= 0.40 && advStructs >= 4) {
      rangeBonus = 0.5;
      reasons.push(`GRA Range: Strong variety (${Math.round(complexRatio * 100)}% complex, ${advStructs} advanced structures) → +0.5`);
    } else if (complexRatio >= 0.30 && advStructs >= 3) {
      rangeBonus = 0.25;
      reasons.push(`GRA Range: Good variety (${Math.round(complexRatio * 100)}% complex, ${advStructs} advanced structures) → +0.25`);
    } else if (complexRatio < 0.10 && advStructs === 0) {
      rangeBonus = -0.5;
      reasons.push(`GRA Range: Monotone structure (${Math.round(complexRatio * 100)}% complex, 0 advanced structures) → -0.5`);
    }
    // else: moderate range — no bonus/penalty

    // ── Step 3: Fragment penalty (control errors, independent of range) ───
    let fragmentPenalty = 0;
    if (fragmentRate > 0.20) {
      fragmentPenalty = -1.0;
      reasons.push(`GRA Control: High fragment rate (${Math.round(fragmentRate * 100)}% of sentences) → -1.0`);
    } else if (fragmentRate > 0.10) {
      fragmentPenalty = -0.5;
      reasons.push(`GRA Control: Some fragments (${Math.round(fragmentRate * 100)}% of sentences) → -0.5`);
    }

    const computed = roundBand(base + rangeBonus + fragmentPenalty);
    const final    = Math.min(computed, hardCaps.grammatical_range_accuracy);
    if (final < computed) {
      reasons.push(`GRA Hard Cap: ${computed} → ${final} (cap: ${hardCaps.grammatical_range_accuracy})`);
    }
    return { score: final, reasons };
  }

  // ── LR ─────────────────────────────────────────────────────────────────────

  /**
   * Compute LR (Lexical Resource) band score.
   *
   * Primary signal: AWL Coverage % (academic vocabulary density).
   * Secondary signals: confirmed advanced word count, cliché density.
   *
   * @param {Object} featureMap
   * @param {Object} hardCaps
   * @returns {{ score: number, reasons: string[] }}
   */
  _computeLR(featureMap, hardCaps) {
    const reasons = [];
    const lexical = featureMap.lexical_resource || {};
    const cohesion = featureMap.cohesion || {};

    const awlCoverage        = lexical.awl_coverage        || 0; // percentage, e.g. 4.5 = 4.5%
    const advancedVocabCount = lexical.advanced_vocab_count || 0;
    // Word family diversity — the RANGE signal (Cambridge LR Band 7+: "a sufficient range").
    // familyRatio = uniqueWordFamilies / totalAWLHits (computed by RuleBasedService).
    // A ratio near 1.0 = each AWL token is a different word family = genuine range.
    // A ratio < 0.5 = >50% of AWL tokens from the same family = repetition, not range.
    const wordFamilyRatio = lexical.word_family_ratio ?? 1.0; // default 1.0 if not yet computed
    const wordFamilyCount = lexical.word_family_count  || 0;

    // ── Step 1: Base score from AWL Coverage ─────────────────────────────
    // Calibrated against expanded AWL list (~400 words, Coxhead Sublists 1-10).
    //
    // RECALIBRATION (2026-06-03, from eval_results.json Group A analysis):
    //   Root cause of LR under-scoring (MAE=1.20, Pearson=0.504):
    //   Narrow AWL list (~400 words) misses topic-specific academic vocabulary
    //   e.g. "biodiversity", "urbanisation", "globalisation", "sustainability".
    //   A Band 7 essay on environmental topics may have AWL% = 4-5% because
    //   topic words are NOT in Coxhead sublist 1-10, but they ARE academic register.
    //   Fix: Lower all thresholds by 0.5-1.0% to reduce systematic under-scoring.
    //
    //   Old thresholds: 2.5/4.0/6.0/10.0
    //   New thresholds: 2.0/3.5/5.0/8.5  (shifted down to correct negative bias)
    let base;
    if (awlCoverage >= 8.5) {
      base = 8.0;
      reasons.push(`LR AWL: High academic coverage (${awlCoverage.toFixed(1)}% ≥ 8.5%) → Band 8 baseline`);
    } else if (awlCoverage >= 5.0) {
      base = 7.0;
      reasons.push(`LR AWL: Good academic coverage (${awlCoverage.toFixed(1)}% in 5-8.5%) → Band 7 baseline`);
    } else if (awlCoverage >= 3.5) {
      base = 6.5;
      reasons.push(`LR AWL: Moderate academic coverage (${awlCoverage.toFixed(1)}% in 3.5-5%) → Band 6.5 baseline`);
    } else if (awlCoverage >= 2.0) {
      base = 6.0;
      reasons.push(`LR AWL: Below-average academic coverage (${awlCoverage.toFixed(1)}% in 2.0-3.5%) → Band 6 baseline`);
    } else if (awlCoverage >= 1.0) {
      base = 5.5;
      reasons.push(`LR AWL: Low academic vocabulary density (${awlCoverage.toFixed(1)}% in 1.0-2.0%) → Band 5.5 baseline`);
    } else {
      base = 5.0;
      reasons.push(`LR AWL: Minimal academic vocabulary (${awlCoverage.toFixed(1)}% < 1.0%) → Band 5 baseline`);
    }

    // ── Step 2: Word Family Diversity penalty (Cambridge RANGE criterion) ─
    // Cambridge Band 7+: "uses a sufficient RANGE of vocabulary".
    // A student who uses 10 AWL tokens but 8 belong to the same family
    // (e.g. "economic", "economy", "economically", "economists") has NOT
    // demonstrated range — they have demonstrated ONE item used repeatedly.
    //
    // Penalty tiers:
    //   familyRatio < 0.40 AND familyCount < 5  : severe repetition  → -1.0
    //   familyRatio < 0.55 AND familyCount < 8  : moderate repetition → -0.5
    //   else: adequate diversity → no penalty
    let diversityPenalty = 0;
    if (wordFamilyRatio < 0.40 && wordFamilyCount < 5) {
      diversityPenalty = -1.0;
      reasons.push(`LR Range: Severe vocabulary repetition — family ratio ${wordFamilyRatio} (<0.40) with only ${wordFamilyCount} unique word families → -1.0 (Cambridge: "range" requires DISTINCT vocabulary items, not the same family repeated)`);
    } else if (wordFamilyRatio < 0.55 && wordFamilyCount < 8) {
      diversityPenalty = -0.5;
      reasons.push(`LR Range: Moderate vocabulary repetition — family ratio ${wordFamilyRatio} (<0.55) with ${wordFamilyCount} unique word families → -0.5 (Cambridge Band 6: "adequate" but limited range)`);
    } else {
      reasons.push(`LR Range: Vocabulary diversity adequate — family ratio ${wordFamilyRatio}, ${wordFamilyCount} unique word families → no range penalty`);
    }

    // ── Step 3: Collocation Bonus — calibrated precision-in-use signal ──────
    // Fix (2026-06-03): Previous collocation_similarity_score mapping was not
    // calibrated against ground truth. New tiers use collocation_hits_high
    // (confirmed high-register collocations from CollocationEmbeddingService)
    // and collocation_hits_mid as secondary signal.
    //
    // Also adds less_common_word_count as a direct Cambridge LR signal:
    // Cambridge Band 7+: "uses less common lexical items with some awareness of style"
    let vocabBonus = 0;
    const collocHighHits    = lexical.collocation_hits_high    ?? 0;
    const collocMidHits     = lexical.collocation_hits_mid     ?? 0;
    const lessCommonCount   = lexical.less_common_word_count   ?? advancedVocabCount;
    const collocSimScore    = lexical.collocation_similarity_score ?? null;

    if (collocSimScore !== null) {
      // CollocationEmbeddingService result available — use calibrated tiers
      // RECALIBRATION (2026-06-03): Tightened from ≥7.0/≥6.5/≤5.0 to ≥7.0/≥6.5/≤5.5.
      // Prevents awarding +0.5 to Band 6 essays that happen to hit 1-2 collocations.
      if (collocHighHits >= 5 || (collocSimScore >= 7.0 && lessCommonCount >= 12)) {
        vocabBonus = 0.5;
        reasons.push(`LR Collocation: High precision-in-use (highHits=${collocHighHits}, score=${collocSimScore}, lessCommon=${lessCommonCount}) → +0.5 (Cambridge: "less common lexical items with style awareness")`);
      } else if (collocHighHits >= 3 || (collocSimScore >= 6.5 && lessCommonCount >= 8)) {
        vocabBonus = 0.25;
        reasons.push(`LR Collocation: Good precision (highHits=${collocHighHits}, score=${collocSimScore}) → +0.25`);
      } else if (collocHighHits === 0 && collocMidHits <= 1 && lessCommonCount < 3) {
        vocabBonus = -0.25;
        reasons.push(`LR Collocation: Limited precision-in-use (highHits=0, midHits=${collocMidHits}, lessCommon=${lessCommonCount}) → -0.25 (Cambridge: "errors in word choice" for low-band essays)`);
      } else {
        reasons.push(`LR Collocation: Adequate (highHits=${collocHighHits}, midHits=${collocMidHits}, score=${collocSimScore}) → no adjustment`);
      }
    } else {
      // Fallback: less_common_word_count (from RuleBasedService LESS_COMMON_WORDS set)
      // These are true C1/C2 words — a reliable LR proxy when CollocationEmbedding is unavailable.
      if (lessCommonCount >= 15) {
        vocabBonus = 0.5;
        reasons.push(`LR Precision (fallback): ${lessCommonCount} C1/C2 less-common words ≥ 15 → +0.5`);
      } else if (lessCommonCount >= 8) {
        reasons.push(`LR Precision (fallback): ${lessCommonCount} C1/C2 words — adequate, no adjustment`);
      } else if (lessCommonCount < 3) {
        vocabBonus = -0.5;
        reasons.push(`LR Precision (fallback): Only ${lessCommonCount} confirmed C1/C2 words < 3 → -0.5`);
      }
    }


    // ── Step 4: Register penalty (informal vocabulary in academic essay) ──
    // Cambridge LR: "uses a limited range" and "inappropriate register" are Band 5
    // signals. Contractions (don't, it's) and slang (gonna, stuff) in a Task 2
    // essay are hard evidence of register failure.
    //
    //   HIGH severity   (density ≥ 3.0 weighted/100w): pervasive informal → -0.5
    //   MEDIUM severity (density ≥ 1.0): noticeable inconsistency → -0.5 only
    //                   when essay already shows low AWL (double weakness, < 4.0%).
    //   LOW / NONE: no penalty — minor slip does not define the essay register.
    const registerSeverity = lexical.register_severity || 'NONE';
    let registerPenalty = 0;
    if (registerSeverity === 'HIGH') {
      registerPenalty = -0.5;
      reasons.push(`LR Register: Pervasive informal vocabulary detected (contractions/slang, severity=HIGH) → -0.5 (Cambridge: inappropriate register penalizes LR)`);
    } else if (registerSeverity === 'MEDIUM' && awlCoverage < 4.0) {
      registerPenalty = -0.5;
      reasons.push(`LR Register: Informal vocabulary combined with low AWL coverage (${awlCoverage.toFixed(1)}%, severity=MEDIUM) → -0.5`);
    }

    // Cliché penalty REMOVED from LR formula.
    // BandConstraintEngine hard cap (density >= 8.0 → LR ≤ 5.5) is the sole ceiling.
    const computed = roundBand(base + diversityPenalty + vocabBonus + registerPenalty);
    const final    = Math.min(computed, hardCaps.lexical_resource);
    if (final < computed) {
      reasons.push(`LR Hard Cap: ${computed} → ${final} (cap: ${hardCaps.lexical_resource} — cliché/AWL ceiling from ConstraintEngine)`);
    }
    return { score: final, reasons };
  }


  // ── CC ─────────────────────────────────────────────────────────────────────

  /**
   * Compute CC (Coherence & Cohesion) band score.
   *
   * Fault-Tolerant Dual-Signal Design:
   *   Band 6.5+ is reachable via EITHER LLM discourse signals (topicSentCount)
   *   OR physical structure signals (paragraphs + sentences + linking + clean cohesion).
   *
   * Rationale: small local LLMs (Ollama) frequently misclassify topic_sentence /
   *   example discourse roles. Requiring the LLM signal alone would systematically
   *   under-score well-structured essays when detection fails. A physical-structure
   *   fallback provides equally valid Cambridge-rubric-aligned evidence.
   *
   * Cambridge Band Descriptors used for calibration:
   *   Band 4: basic cohesive devices, may be inaccurate or repetitive
   *   Band 5: some organisation but lacks overall progression; over/misuse of devices
   *   Band 6: coherent with clear overall progression; cohesion may be faulty/mechanical
   *   Band 7: logically organised; clear progression; appropriate cohesion (minor over/under-use ok)
   *   Band 8: skillfully manages all aspects of cohesion
   *
   * @param {Object} featureMap
   * @param {Object} hardCaps
   * @returns {{ score: number, reasons: string[] }}
   */
  _computeCC(featureMap, hardCaps) {
    const reasons   = [];
    const cohesion  = featureMap.cohesion          || {};
    const discourse = featureMap.discourse?.counts || {};

    const coherenceIssues = cohesion.coherence_issues          || [];
    const hasMechanical   = cohesion.has_mechanical_transitions || false;

    const paragraphCount  = featureMap.sentence_structure?.paragraph_count || 1;
    const totalSentences  = featureMap.sentence_structure?.total_sentences  || 0;
    const topicSentCount  = discourse.topic_sentence || 0;
    const exampleCount    = discourse.example        || 0;
    const totalLinking    = cohesion.total_linking_words || 0;
    const overusedLinking = (cohesion.overused || []).length;
    const hasMultiPara    = paragraphCount >= 3;


    // ── Step 1 + Phase 2 Integration: Blended Discourse Graph + Legacy Topology ────
    // Design: Graph CC score (Phase 2) is blended 60/40 with legacy topology score
    // instead of a full take-all replacement. Rationale:
    //   - LLM discourse graphs have ~15-25% under-extraction rate on local models
    //     (essay truncated to 2500 chars, small model → fewer nodes/edges than reality)
    //   - Blending prevents a low-quality graph from fully overriding strong physical structure
    //   - Cambridge rubric weighs BOTH logical development AND physical organisation
    // Fallback: when graph_cc_score === null, uses legacy topology only (unchanged).

    // Physical proxy thresholds (used by legacy path).
    // Raised minimum sentence count 10 → 12: Band 4-5 essays often have ≥3 paragraphs
    // but only 6-9 sentences — they were reaching CC=6 via goodPhysicalStructure which
    // is calibrated for Band 6+ essays (12+ sentences with adequate linking).
    //
    // RECALIBRATION (2026-06-03): Relax !hasMechanical requirement from goodPhysicalStructure.
    //   Root cause: Band 6-7 essays using "Furthermore" once were flagged hasMechanical=true
    //   → fail goodPhysicalStructure → legacyBase forced down to 5.5 despite good structure.
    //   Cambridge rubric: mechanical transition is a Band 7 BLOCKER (Penalty A below),
    //   NOT a disqualifier for Band 6.0 goodPhysicalStructure rating.
    //   Fix: goodPhysicalStructure no longer requires !hasMechanical. Penalty A handles it.
    const goodPhysicalStructure = hasMultiPara
      && totalSentences  >= 12
      && totalLinking    >= 6
      && overusedLinking <= 1;
    // Note: !hasMechanical removed — mechanical transitions reduce legacyBase via
    // Penalty A (base >= 7.0 cap at 6.5), not via the physical structure gate.

    // Legacy topology score (always computed — used either as blend or as sole signal)
    let legacyBase;
    if (topicSentCount >= 2 && exampleCount >= 1 && hasMultiPara && !hasMechanical && overusedLinking <= 1) {
      legacyBase = 7.0;
      reasons.push(`CC Structure (Legacy 40%): ${topicSentCount} topic sents, ${exampleCount} examples, ${paragraphCount} paras -> 7.0`);
    } else if (topicSentCount >= 1 && hasMultiPara && totalLinking >= 4 && overusedLinking <= 2) {
      legacyBase = 6.5;
      reasons.push(`CC Structure (Legacy 40%): ${topicSentCount} topic sent(s), ${paragraphCount} paras, ${totalLinking} linking -> 6.5`);
    } else if (goodPhysicalStructure) {
      legacyBase = 6.0;
      reasons.push(`CC Structure (Legacy 40%): Physical fallback (${paragraphCount} paras, ${totalSentences} sents, ${totalLinking} linking) -> 6.0`);
    } else if (hasMultiPara && totalLinking >= 4) {
      legacyBase = 6.0;
      reasons.push(`CC Structure (Legacy 40%): ${paragraphCount} paras, ${totalLinking} linking -> 6.0`);
    } else if (hasMultiPara && totalLinking >= 2) {
      legacyBase = 5.5;
      reasons.push(`CC Structure (Legacy 40%): limited cohesive devices (linking=${totalLinking}) -> 5.5`);
    } else if (paragraphCount >= 2) {
      legacyBase = 5.0;
      reasons.push(`CC Structure (Legacy 40%): minimal paragraphing -> 5.0`);
    } else {
      legacyBase = 4.5;
      reasons.push(`CC Structure (Legacy 40%): no paragraph structure -> 4.5`);
    }

    const graphCCScore  = featureMap.discourse_graph?.graph_cc_score ?? null;
    const graphReasons  = featureMap.discourse_graph?.graph_reasons  || [];
    const graphStats    = featureMap.discourse_graph?.graph_stats    || {};

    // ── CC Fix (2026-06-03): Adaptive Blending based on Graph Confidence ───────
    // Root cause of CC Pearson=0.252: static 60/40 blend over-trusts a sparse
    // discourse graph. Small LLM + 2500-char truncation → Band 8 essays with
    // implicit cohesion produce few nodes/edges → graph_cc_score deflated.
    //
    // Solution: compute graph confidence from structural richness.
    // Low confidence (few nodes/edges, no evidence) → trust physical structure more.
    // High confidence (rich graph, counter+rebuttal) → graph deserves 60% weight.
    //
    // Additionally: implicit cohesion signal from Python bridge (pronoun reference
    // + lexical chains) is added to legacyBase as a Band 7.5-8 signal.
    let base;
    if (graphCCScore !== null) {
      const graphNodes  = graphStats.total_nodes    || 0;
      const graphEdges  = graphStats.total_edges    || 0;
      const graphEvid   = graphStats.evidence_examples || 0;
      const hasRebuttal = graphStats.has_counter_rebuttal || false;

      // Graph confidence score (0.0 - 1.0)
      // Components: node richness + edge richness + evidence depth + rebuttal
      const nodeConf    = Math.min(1.0, graphNodes / 8);
      const edgeConf    = Math.min(1.0, graphEdges / 6);
      const evidConf    = Math.min(1.0, graphEvid   / 3);
      const rebutBonus  = hasRebuttal ? 0.15 : 0;
      const graphConf   = parseFloat(
        (nodeConf * 0.35 + edgeConf * 0.30 + evidConf * 0.20 + rebutBonus).toFixed(2)
      );

      // Adaptive weight: high confidence → 60% graph; low → 20% graph
      const graphWeight  = graphConf >= 0.60 ? 0.60
                         : graphConf >= 0.35 ? 0.40
                         : 0.20;  // sparse graph → mostly trust physical structure
      const legacyWeight = 1.0 - graphWeight;

      const blended = parseFloat((graphCCScore * graphWeight + legacyBase * legacyWeight).toFixed(2));
      base = Math.round(blended * 2) / 2;
      reasons.push(...graphReasons);
      reasons.push(
        `CC Phase 2 Adaptive Blend: conf=${graphConf} → Graph(${graphCCScore})×${Math.round(graphWeight*100)}% + Legacy(${legacyBase})×${Math.round(legacyWeight*100)}% = ${blended} → snapped ${base}`
      );
    } else {
      base = legacyBase;
    }

    // ── Implicit Cohesion Bonus (Python bridge signal) ──────────────────────
    // Cambridge Band 8 uses pronoun reference and lexical chains (implicit cohesion)
    // rather than explicit linking words. The legacy path under-scores these essays
    // because it counts linking words. Inject the Python bridge signal here.
    const implicitCohesion = featureMap.implicit_cohesion || {};
    const hasLexicalChains = implicitCohesion.has_lexical_chains === true;
    const pronounRatio     = implicitCohesion.pronoun_reference_ratio || 0;
    if (base >= 6.5 && hasLexicalChains && pronounRatio >= 0.8) {
      base = Math.min(base + 0.5, 8.0);
      reasons.push(
        `CC Implicit Cohesion: lexical chains (${implicitCohesion.lexical_chain_count || 0}) + pronoun reference ratio (${pronounRatio}) → +0.5 (Cambridge Band 8: skilfully uses implicit cohesion)`
      );
    } else if (base >= 6.0 && (hasLexicalChains || pronounRatio >= 0.6)) {
      base = Math.min(base + 0.25, 7.5);
      reasons.push(
        `CC Implicit Cohesion: partial signal (lexicalChains=${hasLexicalChains}, pronounRatio=${pronounRatio}) → +0.25`
      );
    }


    // -- Step 2: Quality penalties (genuine Cambridge deficit signals only) -----

    // Penalty A: Mechanical transitions -- Band 7 blocker
    // Cambridge: "over-use of certain cohesive features" penalises CC.
    if (hasMechanical && base >= 7.0) {
      base = 6.5;
      reasons.push(`CC Transitions: Mechanical Firstly/Secondly/In conclusion pattern -> base capped at 6.5`);
    }

    // Penalty B: Heavy over-use only (>=3 distinct words used >=3x each)
    // Cambridge Band 5: "over-use of cohesive devices". Reduced from 2-tier to 1-tier
    // to avoid double-penalizing essays already demoted by the base tier (overusedLinking
    // >= 2 already prevents reaching base=6.5; overusedLinking >= 3 adds -0.5 on top).
    if (overusedLinking >= 3) {
      base -= 0.5;
      reasons.push(`CC Cohesion: Heavy over-use (${overusedLinking} linking words each used >=3x) -> -0.5 (Cambridge Band 5: repetitive, limited range)`);
    }

    // -- Step 3: Quality bonus for Band 7.5 evidence ---------------------------
    // Cambridge Band 8: "skillfully manages all aspects of cohesion".
    //
    // RECALIBRATION (2026-06-03):
    //   Root cause of Band 7.5-8 under-scoring: qualityBonus required totalLinking >= 10.
    //   Cambridge Band 8 essays PREFER implicit cohesion (pronoun reference, ellipsis,
    //   lexical chains) over explicit linking words. Requiring 10+ explicit links
    //   paradoxically penalizes high-band essays for using natural, implicit cohesion.
    //   Fix: Lower threshold from >= 10 to >= 7.
    let qualityBonus = 0;
    if (base >= 7.0
        && topicSentCount >= 2
        && exampleCount   >= 2
        && totalLinking   >= 7
        && overusedLinking === 0
        && !hasMechanical) {
      qualityBonus = 0.5;
      reasons.push(`CC Quality Bonus: ${topicSentCount} topic sents, ${exampleCount} examples, ${totalLinking} linking, 0 overused -> +0.5 (Band 7.5: Cambridge Band 8 rewards implicit cohesion, not volume of linking words)`);
    }

    // -- Step 4: Neo4j Graph Engine coherence penalty ---------------------------
    // RECALIBRATION (2026-06-03) — Double-counting fix:
    //   When graphCCScore (Phase 2 DiscourseGraph) is active, it already encodes
    //   unsupported_claims, missing evidence, and argument-level incoherence via
    //   the 60/40 blend. Adding full Neo4j penalty on top double-counts the same flaws.
    //   Fix: When Phase 2 is active, halve the Neo4j penalty.
    //     5+ issues: -0.5  (was -1.0 — caused GT_018/019/020 CC to land at 5.5-6.0)
    //     1-4 issues: -0.25 (was -0.5)
    //   Legacy-only path (no Phase 2): original penalties unchanged.
    const n = coherenceIssues.length;
    const isPhase2Active = graphCCScore !== null;
    let coherencePenalty = 0;
    if (n >= 5) {
      coherencePenalty = isPhase2Active ? -0.5 : -1.0;
      reasons.push(`CC Graph (Neo4j): ${n} coherence issues (severe) -> ${coherencePenalty} (${isPhase2Active ? 'Phase 2 active: halved to prevent double-counting' : 'legacy-only: full penalty'})`);
    } else if (n >= 1) {
      coherencePenalty = isPhase2Active ? -0.25 : -0.5;
      reasons.push(`CC Graph (Neo4j): ${n} coherence issue(s) -> ${coherencePenalty} (${isPhase2Active ? 'Phase 2 active: halved to prevent double-counting' : 'legacy-only'})`);
    }

    // Cliche caps handled by BandConstraintEngine only (density>=8 -> CC<=5.5; density>=2.3 -> CC<=6.5).
    const computed = roundBand(base + qualityBonus + coherencePenalty);
    const final    = Math.min(computed, hardCaps.coherence_cohesion);
    if (final < computed) {
      reasons.push(`CC Hard Cap: ${computed} -> ${final} (cap: ${hardCaps.coherence_cohesion})`);
    }
    return { score: final, reasons };
  }

  // ── TR ─────────────────────────────────────────────────────────────────────

  /**
   * Compute TR (Task Response) band score.
   *
   * Two-phase model aligned with Cambridge TR rubric:
   *
   *   Phase 1 — Topic Relevance Gate (TopicRelevanceService):
   *     DRIFT   → hard cap at 4.0 (essay tangentially addresses task)
   *     PARTIAL → cap at tr_band_floor (essay partially addresses task)
   *     ADEQUATE→ no ceiling from relevance — proceed to Phase 2
   *
   *   Phase 2 — Development Quality Score (for ADEQUATE essays only):
   *     Cambridge Band 7: "presents, extends and supports main ideas but
   *       there may be a tendency to over-generalise"
   *     Cambridge Band 6: "addresses the task... relevant but some ideas
   *       may be inadequately developed"
   *     Cambridge Band 5: "only partially addresses the task"
   *
   *     Development proxies (no LLM — deterministic):
   *       - Word count     : sufficient length signals idea development
   *       - Discourse roles: claim + evidence + example = developed argument
   *       - Paragraph count: multiple body paragraphs = multi-idea response
   *       - Semantic score  : high relevance score signals precise engagement
   *
   *   This eliminates the TR=9.0 inflation bug where any on-topic essay
   *   received a perfect TR score regardless of development quality.
   *
   * @param {Object} featureMap
   * @param {Object} hardCaps
   * @returns {{ score: number, reasons: string[] }}
   */
  _computeTR(featureMap, hardCaps) {
    const reasons = [];
    const trData  = featureMap.task_response || {};

    const trBandCap = trData.tr_band_cap ?? 9.0;
    const verdict   = trData.verdict      || 'ADEQUATE';

    // ── Phase 1: Topic Relevance Gate ────────────────────────────────────
    if (verdict === 'DRIFT') {
      reasons.push(`TR: DRIFT — essay does not adequately address the question (relevance: ${trData.relevance_score ?? 'N/A'})`);
      const final = Math.min(trBandCap, hardCaps.task_response);
      return { score: final, reasons };
    }

    if (verdict === 'PARTIAL' || verdict === 'PARTIAL_DISCUSSION') {
      const missed = (trData.missed_keywords || []).slice(0, 5).join(', ');
      reasons.push(`TR: PARTIAL — essay only partially addresses the question (cap: ${trBandCap})`);
      if (missed) reasons.push(`TR: Missed topic keywords: ${missed}`);
      const final = Math.min(trBandCap, hardCaps.task_response);
      return { score: final, reasons };
    }

    if (verdict === 'NO_QUESTION') {
      reasons.push('TR: No question provided — TR not penalized');
      const final = Math.min(trBandCap, hardCaps.task_response);
      return { score: final, reasons };
    }

    // ── Phase 2: Development Quality Score (ADEQUATE essays only) ─────────
    // Cambridge rubric: TR band is determined by HOW WELL the task is addressed,
    // not merely WHETHER it is addressed. An on-topic but underdeveloped essay
    // is Band 5-6 TR, not Band 8-9.
    //
    // FIX (TR saturation): devBase thresholds lowered by 0.5 at every tier.
    // Previously, wordCount>=350 → devBase=7.5 allowed any long essay to reach
    // TR=8.5+ via paraBonus+semanticBonus. Band 8+ TR requires proven argument
    // structure (claims + evidence), not just length.
    reasons.push(`TR: ADEQUATE — essay addresses the question (semantic: ${trData.semantic_score ?? 'N/A'}, keyword: ${trData.keyword_score ?? 'N/A'})`);

    const wordCount     = featureMap.statistics?.word_count || 0;
    const paragraphs    = featureMap.sentence_structure?.paragraph_count || 1;
    const semanticScore = trData.semantic_score || 0;

    // Word count → safety floor ONLY (checklist is the primary signal when available).
    // Cambridge TR assesses HOW WELL the task is addressed, not just length.
    // A 350-word essay full of repetition is still Band 5 TR.
    let devBase;
    const checklistScore = trData.checklist_score ?? null;
    const checklistRatio = trData.checklist_ratio ?? null;
    const usingChecklist = checklistScore !== null;
    const keywordScore   = trData.keyword_score || 0;

    // ── FALLBACK: Word count proxy (legacy path / safety net) ──
    let lengthBase = 4.5;
    if (wordCount >= 350) lengthBase = 6.5;
    else if (wordCount >= 280) lengthBase = 6.0;
    else if (wordCount >= 250) lengthBase = 5.5;
    else if (wordCount >= 220) lengthBase = 5.0;

    if (usingChecklist) {
      // ── PRIMARY SIGNAL: Rubric Checklist Score ───────────────────────────
      // RubricChecklist evaluates YES/NO Cambridge criteria and maps them to a
      // band score. However, Band 7.5+ TR requires holistic examiner judgment that
      // a binary checklist cannot reliably produce.
      //
      // RECALIBRATION (2026-06-03, from eval_results.json Group A analysis):
      //   Root cause of TR over-scoring: checklist cap was 7.5, allowing
      //   devBase=7.5 + adjustment=0.5 = TR=8.0 for Band 6.5 essays (GT_014, 016).
      //   Pattern: essays with Band 6.5 human TR were getting predicted TR=7.0-8.0
      //   because they met all rubric criteria structurally but lacked idea DEPTH.
      //   Fix: Lower cap from 7.5 to 7.0. Band 7.5+ TR requires proven holistic
      //   development that a YES/NO checklist fundamentally cannot detect.
      let rawChecklistBase = Math.min(checklistScore, 7.0);

      // ── TR Fix: Smart Blending for LLM Hallucinations ────────────────────
      // If the small LLM evaluates the checklist too harshly (e.g. <= 5.5) but the essay
      // is on-topic (high keyword score) and well-developed (high word count),
      // we blend the scores to rescue the essay from a false negative.
      if (rawChecklistBase <= 5.5 && lengthBase >= 6.0 && keywordScore >= 0.70) {
        devBase = roundBand((rawChecklistBase + lengthBase) / 2);
        reasons.push(
          `TR Smart Blend: Checklist scored very low (${checklistScore}) but essay is well-developed (${wordCount} words) and on-topic (keyword=${keywordScore.toFixed(2)}). Blended base to ${devBase.toFixed(1)} to prevent LLM false negative.`
        );
      } else {
        devBase = rawChecklistBase;
        if (checklistScore > 7.0) {
          reasons.push(
            `TR Rubric Checklist: ${checklistScore} → capped to 7.0 (Band 7.5+ TR requires holistic idea development beyond checklist scope)`
          );
        } else {
          reasons.push(
            `TR Rubric Checklist: ${checklistScore} (ratio=${(checklistRatio * 100).toFixed(0)}% criteria met — ${trData.checklist_label || 'evaluated'})`
          );
        }
      }
    } else {
      devBase = lengthBase;
      reasons.push(`TR Development (fallback): Word count ${wordCount} → base ${devBase.toFixed(1)}`);
    }

    // Safety floor: very short essays cannot score high regardless of checklist
    if (wordCount < 220 && devBase > 5.0) {
      devBase = 5.0;
      reasons.push(`TR Length safety floor: Word count ${wordCount} < 220 — capping devBase at 5.0 regardless of checklist`);
    }

    // Discourse quality signal: Cambridge Band 7+ explicitly requires the essay to
    // "present, extend AND support main ideas".
    const discourseCounts = featureMap.discourse?.counts || {};
    const claimCount    = (discourseCounts.topic_sentence || 0) + (discourseCounts.claim || 0);
    const evidenceCount = (discourseCounts.evidence || 0) + (discourseCounts.example || 0);

    let discourseBonus = 0;
    if (claimCount >= 2 && evidenceCount >= 2) {
      discourseBonus = 0.5;
      reasons.push(`TR Discourse: ${claimCount} claims + ${evidenceCount} evidence/examples → +0.5`);
    } else if (claimCount === 0 && devBase >= 6.0) {
      discourseBonus = -0.5;
      reasons.push(`TR Discourse: No clear claims despite adequate length → -0.5`);
    }

    // Paragraph bonus
    let paraBonus = 0;
    if (paragraphs >= 4) {
      paraBonus = 0.5;
      reasons.push(`TR Development: ${paragraphs} paragraphs → +0.5`);
    } else if (paragraphs <= 2) {
      paraBonus = -0.5;
      reasons.push(`TR Development: Only ${paragraphs} paragraph(s) → -0.5`);
    }

    // Semantic precision
    let semanticBonus = 0;
    if (trData.semantic_score !== null && trData.semantic_score !== undefined) {
      if (semanticScore >= 0.65) {
        semanticBonus = 0.5;
        reasons.push(`TR Precision: High semantic alignment (${semanticScore.toFixed(2)}) → +0.5`);
      } else if (semanticScore < 0.52) {
        semanticBonus = -0.5;
        reasons.push(`TR Precision: Low semantic score (${semanticScore.toFixed(2)}) → -0.5`);
      }
    }

    // ── BONUS STACKING CAP (Critical fix for TR=9 inflation) ─────────────────
    // When checklist is the primary signal, all three bonuses (discourse + para +
    // semantic) stacking freely allowed devBase=7.5 → TR=9. This was the root
    // cause of TR=9 appearing in 6/20 test cases.
    //
    // Cambridge rubric: Band 8+ TR is not achievable by structure alone. It
    // requires exceptional idea development that the checklist cannot measure.
    //
    // Rule: when using checklist, total positive adjustment is capped at +0.5.
    // Negative adjustments are NOT capped — they still penalise weak essays.
    const rawAdjustment = discourseBonus + paraBonus + semanticBonus;
    let adjustment = rawAdjustment;
    if (usingChecklist && rawAdjustment > 0.5) {
      adjustment = 0.5;
      reasons.push(`TR Bonus cap (checklist mode): raw adjustment +${rawAdjustment.toFixed(1)} → capped at +0.5 (prevents TR inflation beyond Band 8)`);
    }

    const computed = roundBand(devBase + adjustment);
    const final = Math.min(computed, hardCaps.task_response);
    if (final < computed) {
      reasons.push(`TR Hard Cap: ${computed} → ${final} (cap: ${hardCaps.task_response})`);
    }
    return { score: final, reasons };
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Compute and lock all four IELTS band scores plus Overall Band.
   *
   * This is the ONLY public method. Call it once per essay, before any LLM
   * call. The returned object is passed directly to the FeedbackGenerator.
   *
   * @param {Object} featureMap - Aggregated metrics from FeatureBuilder
   *   (must include: grammar, sentence_structure, lexical_resource,
   *    cohesion, discourse, task_response)
   * @param {Object} hardCaps   - Ceilings from BandConstraintEngine.calculateCaps()
   * @returns {{
   *   band_breakdown: {
   *     task_response: number,
   *     coherence_cohesion: number,
   *     lexical_resource: number,
   *     grammatical_range_accuracy: number
   *   },
   *   overall_band:    number,
   *   scoring_reasons: string[],
   *   hard_caps_applied: Object
   * }}
   */
  computeScores(featureMap, hardCaps) {
    const trResult  = this._computeTR(featureMap, hardCaps);
    const ccResult  = this._computeCC(featureMap, hardCaps);
    const lrResult  = this._computeLR(featureMap, hardCaps);
    const graResult = this._computeGRA(featureMap, hardCaps);

    const overall = calculateOverall(
      trResult.score, ccResult.score, lrResult.score, graResult.score
    );

    const allReasons = [
      ...trResult.reasons,
      ...ccResult.reasons,
      ...lrResult.reasons,
      ...graResult.reasons,
      ...(hardCaps.reasons || [])
    ];

    console.log(
      `🔒 ScoringEngine LOCKED: TR=${trResult.score} | CC=${ccResult.score} | ` +
      `LR=${lrResult.score} | GRA=${graResult.score} | Overall=${overall}`
    );

    return {
      band_breakdown: {
        task_response:              trResult.score,
        coherence_cohesion:         ccResult.score,
        lexical_resource:           lrResult.score,
        grammatical_range_accuracy: graResult.score
      },
      overall_band:      overall,
      scoring_reasons:   allReasons,
      hard_caps_applied: hardCaps
    };
  }
}

module.exports = new ScoringEngine();
