/**
 * services/ai/band-constraint.engine.js
 *
 * Responsible for calculating absolute score ceilings (Hard Caps)
 * based on deterministic metrics aligned with Cambridge IELTS rubric.
 *
 * Design principles:
 *   - GRA caps are triggered by ERROR RATE (accuracy), not diversity alone.
 *     A Band 6 essay with zero complex sentences but zero errors is still a 6.
 *     A Band 4 essay can have many complex sentences but all wrong.
 *   - LR caps use AWL Coverage (Academic Word List) as a proxy for lexical
 *     sophistication, replacing TTR which measures diversity, NOT quality.
 *   - TR caps are injected from TopicRelevanceService (keyword-overlap analysis).
 *   - Cliché caps are calibrated from empirical data (10 scored essays).
 */
class BandConstraintEngine {
  /**
   * Calculate absolute band score ceilings (Hard Caps) from deterministic essay metrics.
   * These caps are ABSOLUTE and override LLM scoring — the LLM has no veto over these.
   *
   * @param {Object} featureMap - Aggregated metrics from FeatureBuilder
   * @returns {{ task_response, coherence_cohesion, lexical_resource, grammatical_range_accuracy, reasons }}
   */
  calculateCaps(featureMap) {
    const caps = {
      task_response: 9.0,
      coherence_cohesion: 9.0,
      lexical_resource: 9.0,
      grammatical_range_accuracy: 9.0,
      reasons: []
    };

    const wordCount = featureMap.statistics?.word_count || 0;
    const sentenceCount = featureMap.statistics?.sentence_count || 0;

    // ── 1. WORD COUNT PENALTY ─────────────────────────────────────────────────
    if (wordCount < 50) {
      this._applyGlobalCap(caps, 3.0, "Bài viết quá ngắn (dưới 50 từ), không đủ dữ liệu để đánh giá.");
    } else if (wordCount < 150) {
      caps.task_response = Math.min(caps.task_response, 4.0);
      caps.coherence_cohesion = Math.min(caps.coherence_cohesion, 5.0);
      caps.lexical_resource = Math.min(caps.lexical_resource, 5.0);
      caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 5.0);
      caps.reasons.push("Bài viết thiếu hụt độ dài nghiêm trọng (dưới 150 từ).");
    } else if (wordCount < 250) {
      caps.task_response = Math.min(caps.task_response, 5.0);
      caps.reasons.push("Bài viết chưa đạt độ dài chuẩn IELTS Task 2 (dưới 250 từ).");
    }

    // ── 2. SENTENCE COUNT PENALTY ─────────────────────────────────────────────
    if (sentenceCount < 5) {
      caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 4.0);
      caps.reasons.push("Số lượng câu quá ít, không thể chứng minh được sự đa dạng cấu trúc (Grammatical Range).");
    }

    // ── 3. TR TOPIC DRIFT PENALTY ─────────────────────────────────────────────
    // Source: feature_map.task_response injected by TopicRelevanceService (topic-relevance.service.js)
    // Cambridge Rubric:
    //   Band 7: "addresses all parts of the task"
    //   Band 6: "addresses the relevant parts of the task"  
    //   Band 5: "only partially addresses the task"
    //   Band 4: "only tangentially addresses the task"
    const trVerdict = featureMap.task_response?.verdict;
    const trBandCap = featureMap.task_response?.tr_band_cap || 9.0;
    const trScore = featureMap.task_response?.relevance_score || 1.0;

    if (trVerdict === "DRIFT") {
      caps.task_response = Math.min(caps.task_response, 4.0);
      caps.reasons.push(`Bài viết lạc đề nghiêm trọng (TR relevance: ${trScore}). TR bị giới hạn ≤ 4.0.`);
    } else if (trVerdict === "PARTIAL") {
      caps.task_response = Math.min(caps.task_response, trBandCap);
      const missedKw = featureMap.task_response?.missed_keywords?.slice(0, 5).join(", ") || "";
      caps.reasons.push(`Bài viết chỉ trả lời một phần câu hỏi (TR relevance: ${trScore}). TR bị giới hạn ≤ ${trBandCap}. Từ khóa bỏ sót: ${missedKw}`);
    }
    // ADEQUATE: no cap — let LLM decide within the natural range

    // ── 4. CLICHÉ / TEMPLATE PHRASE PENALTY (EMPIRICALLY CALIBRATED) ──────────
    // Thresholds derived from calibrate_cliche_threshold.js on 10 IELTS essays:
    //   Band 5 avg density: 11.52 | Band 6 avg: 4.44 | Band 7 avg: 0.20
    //
    // Threshold logic (midpoints between band groups):
    //   HIGH   ≥ 8.0  → clearly Band 5 territory (avg 11.5)
    //   MEDIUM ≥ 2.3  → Band 6 territory (avg 4.4, well above Band 7 avg 0.2)
    //   LOW    ≥ 1.2 + mechanical → Band 6.5 territory (above Band 7 natural level)
    const clicheDensity = featureMap.cohesion?.cliche_density || 0;
    const clicheCounts = featureMap.cohesion?.cliche_counts_by_tier || {};
    const hasMechanicalTransitions = featureMap.cohesion?.has_mechanical_transitions || false;

    if (clicheDensity >= 8.0) {
      // Band 5 territory: essay saturated with template language.
      // GRA is NOT penalized here — cliché is a lexical/cohesion issue, not a grammatical one.
      // Cambridge GRA descriptors assess grammatical STRUCTURES and ACCURACY, not vocabulary choices.
      caps.coherence_cohesion = Math.min(caps.coherence_cohesion, 5.5);
      caps.lexical_resource   = Math.min(caps.lexical_resource,   5.5);
      caps.reasons.push(`Mật độ cụm từ rập khuôn ở mức NGHIÊM TRỌNG (${clicheDensity}/100 từ, ngưỡng Band 5: ≥8.0). CC/LR bị giới hạn ≤ 5.5. GRA không bị ảnh hưởng (cliché là lỗi CC/LR, không phải GRA).`);
    } else if (clicheDensity >= 2.3) {
      // Band 6-7 boundary territory.
      // CC cap raised 6.0 → 6.5 to prevent double-counting:
      //   ScoringEngine._computeCC() already applies a formula penalty of -0.5 for this range.
      //   Old: base(7.0) - 0.5 = 6.5 → then capped to 6.0 = effective penalty -1.0 (too harsh).
      //   New: base(7.0) - 0.5 = 6.5 → cap at 6.5 = net -0.5 (one penalty, not two).
      // GRA cap removed — cliché density is not a GRA criterion.
      caps.coherence_cohesion = Math.min(caps.coherence_cohesion, 6.5);
      caps.reasons.push(`Mật độ cụm từ rập khuôn CAO (${clicheDensity}/100 từ, ngưỡng Band 6: ≥2.3). CC bị giới hạn ≤ 6.5 (Band 7 ceiling). GRA không bị ảnh hưởng.`);
    } else if (clicheDensity >= 1.2 && hasMechanicalTransitions) {
      // Band 6.5 territory: mechanical transitions dominate.
      caps.coherence_cohesion = Math.min(caps.coherence_cohesion, 6.5);
      caps.reasons.push(`Bài viết lạm dụng cụm liên kết cơ học (${clicheCounts.MECHANICAL || 0} lần, density ${clicheDensity}/100 từ). CC bị giới hạn ≤ 6.5.`);
    }

    // ── 5. GRA: ACCURACY CONTROL (CAMBRIDGE RUBRIC ALIGNED) ──────────────────
    // Cambridge Rubric truth:
    //   GRA is about ACCURACY when using a range of structures.
    //   A 100%-simple-sentence essay with no errors = GRA 6.0 (limited range, but controlled).
    //   An essay with many complex sentences but rampant errors = GRA 4.0-5.0.
    //   Therefore: we cap on ERROR RATE (fragments/run-ons), NOT on complex_ratio alone.
    const totalSentences = featureMap.sentence_structure?.total_sentences || 0;
    const complexCount   = featureMap.sentence_structure?.complex || 0;
    const fragmentCount  = featureMap.sentence_structure?.fragments || 0;
    const advancedStructureCount = featureMap.sentence_structure?.advanced_structure_count || 0;
    const majorErrorCount = featureMap.grammar?.severity_breakdown?.major || 0;
    const totalErrors     = featureMap.grammar?.total_errors || 0;

    if (totalSentences > 0) {
      const fragmentRate  = fragmentCount / totalSentences;
      const complexRatio  = complexCount  / totalSentences;
      const majorErrorRate = totalSentences > 0 ? majorErrorCount / totalSentences : 0;

      // RESCUE CLAUSE: If the essay deploys multiple advanced structures (inversion, cleft,
      // passive, conditionals), some fragments may be parser errors on C2-level syntax.
      const isHighlyAdvanced = advancedStructureCount >= 3;

      // 5.0. Band 4 cap — very high raw error rate (NEW)
      // Cambridge Band 4: "attempts a limited range of structures, mostly erroneous,
      // causing difficulty for the reader".
      // errorRate >= 12.0/100w is firmly Band 4 GRA territory regardless of other signals.
      const errorRate = featureMap.grammar?.error_per_100_words || 0;
      if (errorRate >= 12.0) {
        caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 4.5);
        caps.reasons.push(`Lỗi ngữ pháp mức CỰC KỲ NGHIÊM TRỌNG (${errorRate.toFixed(1)}/100 từ ≥ 12.0). GRA ≤ 4.5. (Cambridge Band 4: mostly erroneous, causes difficulty for reader).`);
      }

      // 5.1. Sentence control — accuracy (Cap from ERRORS, not diversity)
      // Cambridge Band 5: "makes frequent grammatical errors and punctuation may be faulty"
      if (fragmentRate > 0.20 && !isHighlyAdvanced) {
        caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 5.0);
        caps.reasons.push(`Lỗi kiểm soát câu nghiêm trọng: tỉ lệ câu cụt/vỡ ${Math.round(fragmentRate * 100)}% (>20%). GRA ≤ 5.0. (Cambridge: Band 5 — frequent grammatical errors)`);
      } else if (fragmentRate > 0.10 && !isHighlyAdvanced) {
        // Cambridge Band 6: "makes some errors in grammar and punctuation but these rarely reduce communication"
        caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 6.0);
        caps.reasons.push(`Kiểm soát cú pháp chưa vững: lỗi fragment chiếm ${Math.round(fragmentRate * 100)}% (>10%). GRA ≤ 6.0. (Cambridge: Band 6 — some control errors)`);
      }

      // 5.2. Major error rate (SVA, TENSE, RUN-ON are always control errors in Cambridge)
      // This is separate from fragment check — both can apply.
      if (majorErrorRate > 0.40) {
        // More than 40% of sentences have a major grammatical error
        caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 5.0);
        caps.reasons.push(`Tỉ lệ lỗi nghiêm trọng (SVA/TENSE/RUN-ON) quá cao: ${Math.round(majorErrorRate * 100)}% số câu. GRA ≤ 5.0.`);
      } else if (majorErrorRate > 0.20) {
        caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 6.0);
        caps.reasons.push(`Lỗi ngữ pháp cốt lõi lặp lại: ${Math.round(majorErrorRate * 100)}% số câu có lỗi SVA/TENSE/RUN-ON. GRA ≤ 6.0.`);
      }

      // 5.3. Structural diversity — only caps Band 7+ (NOT Band 6 and below)
      // Cambridge Band 7: "uses a variety of complex structures with some flexibility and accuracy"
      // Rule: ONLY cap at 6.5 (cannot reach 7+) if essay has ZERO complex structures AND ZERO advanced patterns.
      // A safe all-simple essay with no errors still earns Band 6, not lower.
      if (complexRatio < 0.10 && advancedStructureCount === 0 && caps.grammatical_range_accuracy > 6.0) {
        caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 6.0);
        caps.reasons.push(`Thiếu đa dạng cấu trúc (${Math.round(complexRatio * 100)}% câu phức, 0 cấu trúc nâng cao). Bài viết an toàn nhưng đơn điệu. GRA ≤ 6.0 (không thể đạt Band 7+ mà không có cấu trúc phức).`);
      }
    }

    // ── 6. LR: LEXICAL SOPHISTICATION CAP (AWL-BASED, NOT TTR) ───────────────
    // Cambridge Rubric truth:
    //   LR is assessed by RANGE, PRECISION, and REGISTER — not by word diversity (TTR).
    //   AWL Coverage (% of tokens in Academic Word List) approximates lexical sophistication.
    //
    // CALIBRATION (expanded AWL list ~400 words, Coxhead Sublists 1-10):
    //   Research and empirical analysis on IELTS essay corpora shows:
    //   Band 5 (A2/B1): ~1-3%   — limited academic vocabulary
    //   Band 6 (B2):    ~3-6%   — adequate academic vocabulary for the task
    //   Band 7 (C1):    ~6-10%  — good range, used with precision
    //   Band 8-9 (C2):  ~10%+   — wide range, precise, flexible use
    //
    // IMPORTANT: AWL is a SOFT signal. Cap only triggers when BOTH AWL AND
    //   advancedVocabCount are below threshold, preventing penalization of
    //   essays using topic-specific vocabulary not in the standard AWL.
    const awlCoverage = featureMap.lexical_resource?.awl_coverage || 0; // percentage (e.g., 4.5 = 4.5%)
    const advancedVocabCount = featureMap.lexical_resource?.advanced_vocab_count || 0;

    if (awlCoverage < 3.0 && advancedVocabCount < 4) {
      // Very low academic vocabulary density — clearly limited range (Band 5 territory)
      // Cambridge Band 5: "uses a limited range of vocabulary"
      caps.lexical_resource = Math.min(caps.lexical_resource, 5.5);
      caps.reasons.push(`Mat do tu vung hoc thuat rat thap (AWL: ${awlCoverage.toFixed(1)}% <3.0% va chi ${advancedVocabCount} tu B2+). LR <= 5.5. (Cambridge: Band 5 - limited range).`);
    } else if (awlCoverage < 5.0 && advancedVocabCount < 7) {
      // Below-average academic vocabulary — Band 6 ceiling
      // Cambridge Band 6: "uses an adequate range of vocabulary for the task"
      caps.lexical_resource = Math.min(caps.lexical_resource, 6.5);
      caps.reasons.push(`Mat do tu vung hoc thuat o muc trung binh thap (AWL: ${awlCoverage.toFixed(1)}% <5.0% va <7 tu B2+). LR <= 6.5. (Cambridge: Band 6 - adequate but limited range).`);
    }


    return caps;
  }

  _applyGlobalCap(caps, limit, reason) {
    caps.task_response = Math.min(caps.task_response, limit);
    caps.coherence_cohesion = Math.min(caps.coherence_cohesion, limit);
    caps.lexical_resource = Math.min(caps.lexical_resource, limit);
    caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, limit);
    caps.reasons.push(reason);
  }
}

module.exports = new BandConstraintEngine();
