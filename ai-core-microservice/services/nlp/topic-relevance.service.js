/**
 * services/nlp/topic-relevance.service.js
 *
 * TR (Task Response) Topic Drift Detection — Hybrid Semantic + Keyword Engine.
 *
 * Architecture:
 *   PRIMARY  — Semantic cosine similarity between question embedding and essay
 *              sentence embeddings. Correctly handles paraphrase and synonym usage.
 *   SECONDARY — Keyword-overlap analysis (kept as fallback and explainability signal).
 *   VERDICT   — max(semanticScore, keywordScore) prevents false DRIFT on synonym-heavy essays.
 *
 * Embedding sources (in priority order):
 *   1. sentenceEmbeddings from Python NLP (already computed in Layer 1 — zero extra cost)
 *   2. Ollama nomic-embed-text (async, when Python NLP is degraded)
 *   3. Pure keyword fallback (when both embedding sources fail)
 *
 * IELTS TR Rubric (Cambridge):
 *   Band 7: "addresses all parts of the task"
 *   Band 6: "addresses the relevant parts of the task"
 *   Band 5: "only partially addresses the task"
 *   Band 4: "only tangentially addresses the task"
 */

const { OllamaEmbeddings } = require("@langchain/ollama");

// ─── Stop Words ───────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "to", "of", "in", "on",
  "at", "by", "for", "with", "about", "as", "this", "that", "these",
  "those", "it", "its", "they", "them", "their", "we", "you", "your",
  "our", "my", "his", "her", "which", "who", "what", "how", "when",
  "where", "why", "and", "or", "but", "not", "no", "so", "than",
  "more", "some", "any", "all", "both", "each", "other", "into",
  "through", "during", "while", "if", "whether", "essay", "argument",
  "opinion", "view", "agree", "disagree", "believe", "think", "consider",
  "many", "much", "very", "also", "furthermore", "however", "therefore",
  "moreover", "additionally"
]);

// Task directive keywords — excluded from topical keyword matching
const DIRECTIVE_KEYWORDS = new Set([
  "discuss", "both", "views", "give", "opinion", "do", "agree",
  "disagree", "what", "extent", "advantages", "disadvantages",
  "causes", "effects", "solutions", "problems", "reasons", "impacts",
  "consequences", "measures", "steps", "ways", "how", "why",
  "examine", "analyze", "evaluate", "consider", "explain", "describe"
]);

// ─── Semantic Thresholds (nomic-embed-text / MiniLM) ─────────────────────────
// Calibrated empirically on IELTS essays:
//   On-topic (synonym/paraphrase):  cosine ~0.50–0.75
//   Partially on-topic:             cosine ~0.35–0.49
//   Off-topic:                      cosine ~0.10–0.30
const SEMANTIC_ADEQUATE = 0.50;
const SEMANTIC_PARTIAL_HI = 0.35;
const SEMANTIC_PARTIAL_LO = 0.22;

// Keyword overlap thresholds (conservative — IELTS band 7+ essays paraphrase heavily)
const KW_ADEQUATE = 0.40;
const KW_PARTIAL_HI = 0.25;
const KW_PARTIAL_LO = 0.15;

class TopicRelevanceService {
  constructor() {
    this._embedder = new OllamaEmbeddings({
      model: process.env.OLLAMA_EMBED_MODEL || "all-minilm",
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    });
    // Tracks whether Ollama embedding is reachable (circuit breaker state)
    this._ollamaEmbedAvailable = true;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Standard cosine similarity between two numeric vectors.
   *
   * Returns a value in [-1, 1]. For normalized embedding vectors produced by
   * models such as nomic-embed-text or MiniLM, the output is practically
   * always in [0, 1] since those models output non-negative representations.
   *
   * @param {number[]} a
   * @param {number[]} b
   * @returns {number} similarity in [-1, 1]; returns 0 if either vector is empty
   */
  _cosine(a, b) {
    if (!a || !b || a.length === 0 || b.length === 0) return 0;
    const len = Math.min(a.length, b.length);
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < len; i++) {
      dot   += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  /**
   * Element-wise average of a list of equal-length vectors.
   *
   * @param {number[][]} vectors
   * @returns {number[]} averaged vector, or [] if input is empty
   */
  _averageVectors(vectors) {
    const valid = vectors.filter(v => v && v.length > 0);
    if (valid.length === 0) return [];
    const dim = valid[0].length;
    const avg = new Array(dim).fill(0);
    for (const v of valid) {
      for (let i = 0; i < dim; i++) avg[i] += v[i];
    }
    return avg.map(x => x / valid.length);
  }

  /**
   * Extract meaningful content keywords from text.
   * Filters stop words, directive words, and very short tokens.
   *
   * @param {string} text
   * @returns {Set<string>}
   */
  _extractKeywords(text) {
    if (!text) return new Set();
    return new Set(
      text
        .toLowerCase()
        .replace(/[^a-z\s]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 3 && !STOP_WORDS.has(w) && !DIRECTIVE_KEYWORDS.has(w))
    );
  }

  /**
   * Split a multi-part IELTS question into individual parts.
   * Handles "?" separators and numbered patterns like "1. ... 2. ...".
   *
   * @param {string} question
   * @returns {string[]}
   */
  _splitQuestionParts(question) {
    if (!question) return [];
    const parts = question
      .split(/\?|(?=\d+\.\s)/)
      .map(p => p.trim())
      .filter(p => p.length > 10);
    return parts.length > 0 ? parts : [question];
  }

  /**
   * Detect the IELTS Task 2 type from the question prompt.
   *
   * Cambridge defines five Task 2 types, each with distinct TR requirements:
   *   DISCUSSION    — "Discuss both views" / "Discuss both sides" (MUST present both)
   *   OPINION       — "To what extent do you agree/disagree" / "Do you agree"
   *   PROBLEM_SOL   — "What are the causes?" / "What solutions are there?"
   *   CAUSE_EFFECT  — "What are the effects?" / "What are the consequences?"
   *   TWO_PART      — Question with two explicit sub-questions (e.g. "Why? What can be done?")
   *   GENERAL       — Catch-all for prompts that don't match the above patterns
   *
   * @param {string} question
   * @returns {'DISCUSSION'|'OPINION'|'PROBLEM_SOL'|'CAUSE_EFFECT'|'TWO_PART'|'GENERAL'}
   */
  _detectTaskType(question) {
    if (!question) return 'GENERAL';
    const q = question.toLowerCase();

    // Two-part questions (e.g. "Why? What can be done?") — check before others
    const questionMarkCount = (q.match(/\?/g) || []).length;
    if (questionMarkCount >= 2) return 'TWO_PART';

    if (/discuss both (views|sides|opinions|arguments)/i.test(q) ||
        /discuss.*(advantages and disadvantages|pros and cons)/i.test(q)) {
      return 'DISCUSSION';
    }
    if (/to what extent.*(agree|disagree)/i.test(q) ||
        /do you agree or disagree/i.test(q) ||
        /do you think.*(positive|negative|good|bad)/i.test(q) ||
        /(is this|is it).*(positive|negative).*(development|trend)/i.test(q)) {
      return 'OPINION';
    }
    if (/what.*(causes?|reasons?|factors?)/i.test(q) &&
        /what.*(solutions?|measures?|steps?|can be done)/i.test(q)) {
      return 'PROBLEM_SOL';
    }
    if (/what.*(effects?|consequences?|impacts?|results?)/i.test(q)) {
      return 'CAUSE_EFFECT';
    }
    return 'GENERAL';
  }

  /**
   * For DISCUSSION task type: check whether the essay presents BOTH views.
   *
   * Cambridge Band 6+: "addresses the requirements of the task"
   * Cambridge Band 5: "only partially addresses the task"
   * A Discussion essay that presents only one perspective CANNOT score above
   * Band 5 TR regardless of how well that single view is argued.
   *
   * Detection heuristics:
   *   - Presence of contrast markers ("however", "on the other hand",
   *     "opponents argue", "critics claim") signals a second perspective.
   *   - Both "advantages" AND "disadvantages" signals (or similar pairs).
   *   - Multiple paragraph thesis statements that shift perspective.
   *
   * @param {string} essay
   * @returns {{ balanced: boolean, evidence: string[] }}
   */
  _checkDiscussionBalance(essay) {
    const lower = essay.toLowerCase();
    const evidence = [];

    // Contrast markers — signal that a second view is being introduced
    const CONTRAST_MARKERS = [
      'on the other hand', 'however', 'nevertheless', 'in contrast',
      'conversely', 'opponents argue', 'critics argue', 'critics claim',
      'some people believe', 'others believe', 'others argue', 'others think',
      'proponents', 'advocates', 'supporters of', 'those who oppose',
      'the opposing view', 'the other side'
    ];
    const contrastHits = CONTRAST_MARKERS.filter(m => lower.includes(m));
    if (contrastHits.length >= 2) {
      evidence.push(`Contrast markers found: ${contrastHits.slice(0, 3).join(', ')}`);
    }

    // Advantage/disadvantage pairs
    const hasAdvantage    = /advantage|benefit|positive|merit/i.test(lower);
    const hasDisadvantage = /disadvantage|drawback|negative|downside|problem|concern/i.test(lower);
    if (hasAdvantage && hasDisadvantage) {
      evidence.push('Both positive and negative aspects discussed');
    }

    // "Both" keyword in body (not just in intro echoing the question)
    const bodyText = lower.replace(/^.{0,300}/, ''); // skip intro (~300 chars)
    if (/\bboth\b.{0,60}\bview|side|argument|perspective/i.test(bodyText)) {
      evidence.push('Both views referenced in body paragraph');
    }

    // Decision: balanced if at least 2 independent signals are present
    const balanced = evidence.length >= 2 || contrastHits.length >= 3;
    return { balanced, evidence };
  }

  /**
   * Keyword overlap score between question keywords and essay text.
   * Uses suffix-based stemming (strip 2 chars) as a lightweight morphology heuristic.
   *
   * @param {Set<string>} keywords
   * @param {string} essayText
   * @returns {number} 0.0–1.0
   */
  _keywordCoverage(keywords, essayText) {
    if (keywords.size === 0) return 1.0;
    const lower = essayText.toLowerCase();
    let hits = 0;
    for (const kw of keywords) {
      const stem = kw.slice(0, -2);
      if (lower.includes(kw) || (stem.length > 3 && lower.includes(stem))) hits++;
    }
    return hits / keywords.size;
  }

  /**
   * Compute semantic similarity between the question and essay.
   *
   * Strategy (zero-extra-cost when Python NLP ran):
   *   1. If sentenceEmbeddings provided → average them → essay vector (free).
   *   2. Else → embed essay via Ollama (async, 1 extra call).
   *   Always embeds the question via Ollama (1 call).
   *
   * Returns the RAW cosine similarity clamped to [0, 1].
   * nomic-embed-text generates non-negative embedding vectors, so cosine is
   * already in [0, 1]. The previous (score+1)/2 normalization was incorrect:
   * it inflated scores (raw 0.35 → 0.675) causing PARTIAL essays to exceed the
   * SEMANTIC_ADEQUATE=0.50 threshold and receive ADEQUATE verdicts. The
   * calibrated thresholds (SEMANTIC_ADEQUATE/PARTIAL_HI/PARTIAL_LO) are
   * defined against raw cosine values, matching the comments at the top of
   * this file, so no threshold adjustment is needed.
   *
   * Returns null if both embedding sources fail (caller falls back to keyword-only).
   *
   * @param {string} question
   * @param {string} essay
   * @param {number[][]} sentenceEmbeddings - pre-computed from Python NLP (may be empty)
   * @returns {Promise<number|null>} raw cosine in [0, 1], or null on total failure
   */
  async _semanticScore(question, essay, sentenceEmbeddings = []) {
    try {
      // Step 1: Get essay vector
      let essayVec;
      const validEmbeddings = (sentenceEmbeddings || []).filter(e => e && e.length > 0);

      if (validEmbeddings.length > 0) {
        // Fast path: reuse Python NLP embeddings — zero Ollama calls for essay
        essayVec = this._averageVectors(validEmbeddings);
        console.log(`📐 TR Semantic: using ${validEmbeddings.length} pre-computed sentence embeddings.`);
      } else if (this._ollamaEmbedAvailable) {
        // Slow path: embed essay chunk via Ollama
        // Limit to first ~600 chars (intro + opening body) — most topically dense
        const essayChunk = essay.trim().slice(0, 600);
        essayVec = await this._embedder.embedQuery(essayChunk);
        console.log("📐 TR Semantic: embedded essay chunk via Ollama.");
      } else {
        return null; // both sources unavailable
      }

      // Step 2: Embed question via Ollama
      if (!this._ollamaEmbedAvailable) return null;
      const questionVec = await this._embedder.embedQuery(question.trim());

      // Step 3: Raw cosine similarity, clamped to [0, 1].
      // nomic-embed-text produces non-negative vectors → cosine is already in [0, 1].
      // Do NOT apply (score+1)/2 normalization — that would inflate every score
      // and cause PARTIAL essays (raw ~0.35) to exceed SEMANTIC_ADEQUATE (0.50).
      const score = this._cosine(questionVec, essayVec);
      return Math.max(0, score);
    } catch (err) {
      console.warn("⚠️ TR Semantic: embedding failed, disabling Ollama embed for this session:", err.message);
      this._ollamaEmbedAvailable = false;
      return null;
    }
  }

  /**
   * Map a numeric relevance score to a TR verdict and band cap.
   *
   * Two-path logic — Semantic is authoritative when available:
   *
   *   PATH 1 (Semantic available):
   *     - Semantic score drives the verdict entirely.
   *     - Keyword acts as a rescue ONLY if Semantic says DRIFT, covering the edge case
   *       where an embedding artifact under-scores a valid essay.
   *     - Rescue Net is fully symmetric with PATH 2 (all 3 KW tiers covered).
   *
   *   PATH 2 (Semantic unavailable — embedding system down):
   *     - Pure keyword fallback with identical tier logic.
   *
   * @param {number|null} semanticScore - normalized to [0,1]; null if Ollama + Python both failed
   * @param {number}      keywordScore  - overlap ratio [0,1]
   * @returns {{ score: number, verdict: string, trBandFloor: number, usesSemantic: boolean }}
   */
  _toVerdict(semanticScore, keywordScore) {
    const usesSemantic = semanticScore !== null;
    let verdict     = "DRIFT";
    let trBandFloor = 4.0;
    let finalScore  = keywordScore;

    if (usesSemantic) {
      // ── PATH 1: Semantic is the authoritative signal ──────────────────────
      finalScore = semanticScore;

      if (semanticScore >= SEMANTIC_ADEQUATE) {
        verdict     = "ADEQUATE";
        trBandFloor = 9.0;

      } else if (semanticScore >= SEMANTIC_PARTIAL_HI) {
        verdict     = "PARTIAL";
        trBandFloor = 6.0;

      } else if (semanticScore >= SEMANTIC_PARTIAL_LO) {
        verdict     = "PARTIAL";
        trBandFloor = 5.0;

      } else {
        // Semantic says DRIFT — activate Rescue Net (keyword as last resort).
        // Fully symmetric with PATH 2: all 3 KW tiers are checked.
        // Rationale: embedding centroid can shift for very short intros or unusual
        // paraphrase patterns, causing false DRIFT on otherwise valid essays.
        if (keywordScore >= KW_ADEQUATE) {
          verdict     = "ADEQUATE";
          trBandFloor = 9.0;
          finalScore  = Math.max(semanticScore, keywordScore);
        } else if (keywordScore >= KW_PARTIAL_HI) {
          verdict     = "PARTIAL";
          trBandFloor = 6.0;
          finalScore  = Math.max(semanticScore, keywordScore);
        } else if (keywordScore >= KW_PARTIAL_LO) {
          // Gap fix: previously missing — keywordScore 0.15–0.24 was incorrectly
          // falling through to DRIFT in PATH 1 while PATH 2 correctly gave 5.0 cap.
          verdict     = "PARTIAL";
          trBandFloor = 5.0;
          finalScore  = Math.max(semanticScore, keywordScore);
        } else {
          // Both signals say DRIFT — high confidence the essay is off-topic
          verdict     = "DRIFT";
          trBandFloor = 4.0;
        }
      }

    } else {
      // ── PATH 2: Semantic unavailable — pure keyword fallback ──────────────
      finalScore = keywordScore;

      if (keywordScore >= KW_ADEQUATE) {
        verdict     = "ADEQUATE";
        trBandFloor = 9.0;
      } else if (keywordScore >= KW_PARTIAL_HI) {
        verdict     = "PARTIAL";
        trBandFloor = 6.0;
      } else if (keywordScore >= KW_PARTIAL_LO) {
        verdict     = "PARTIAL";
        trBandFloor = 5.0;
      } else {
        verdict     = "DRIFT";
        trBandFloor = 4.0;
      }
    }

    return { score: parseFloat(finalScore.toFixed(2)), verdict, trBandFloor, usesSemantic };
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Analyze whether the essay adequately addresses the question prompt.
   *
   * Now async — must be awaited in writing.service.js.
   *
   * @param {string}     question           - IELTS essay question/prompt
   * @param {string}     essay              - Student's essay text
   * @param {number[][]} sentenceEmbeddings - Pre-computed sentence embeddings from Python NLP
   *                                          (pass pythonData.map(s => s.embedding))
   *                                          If empty/null, falls back to Ollama embed.
   * @returns {Promise<{
   *   relevance_score: number,
   *   semantic_score: number|null,
   *   keyword_score: number,
   *   parts_coverage: Array,
   *   missed_keywords: string[],
   *   question_keyword_count: number,
   *   tr_band_floor: number,
   *   verdict: string,
   *   method: string
   * }>}
   */
  async analyze(question, essay, sentenceEmbeddings = []) {
    if (!question || question.trim().length < 5) {
      return {
        relevance_score:      1.0,
        semantic_score:       null,
        keyword_score:        1.0,
        parts_coverage:       [],
        missed_keywords:      [],
        question_keyword_count: 0,
        tr_band_floor:        9.0,
        verdict:              "NO_QUESTION",
        task_type:            'GENERAL',
        discussion_balance:   null,
        method:               "none"
      };
    }

    // ── Task Type Detection ────────────────────────────────────────────
    // Detect what type of TR is required BEFORE topic relevance analysis.
    // This allows the verdict step to apply task-type-specific penalties.
    const taskType = this._detectTaskType(question);
    let discussionBalance = null;
    let discussionPenaltyActive = false;

    if (taskType === 'DISCUSSION') {
      discussionBalance = this._checkDiscussionBalance(essay);
      if (!discussionBalance.balanced) {
        // Cambridge: a Discussion essay presenting only one view CANNOT be
        // fully on-task. TR floor is capped at 5.5 regardless of topic relevance.
        discussionPenaltyActive = true;
        console.warn(`⚠️ TR Task-Type Check: DISCUSSION essay may only present ONE view. TR floor capped at 5.5.`);
      }
    }

    // ── Keyword Analysis (always runs — provides per-part breakdown + explainability) ──
    const questionParts = this._splitQuestionParts(question);
    const allKeywords   = this._extractKeywords(question);
    const partsCoverage = [];
    let totalKwCoverage = 0;

    for (const part of questionParts) {
      const partKw  = this._extractKeywords(part);
      const cov     = this._keywordCoverage(partKw, essay);
      partsCoverage.push({
        part:           part.slice(0, 80) + (part.length > 80 ? "..." : ""),
        keyword_count:  partKw.size,
        coverage_ratio: parseFloat(cov.toFixed(2)),
        covered:        cov >= KW_ADEQUATE
      });
      totalKwCoverage += cov;
    }

    const keywordScore = questionParts.length > 0
      ? totalKwCoverage / questionParts.length
      : 1.0;

    // Missed keywords (for LLM prompt explainability)
    const missedKeywords = [];
    for (const kw of allKeywords) {
      const stem = kw.slice(0, -2);
      if (!essay.toLowerCase().includes(kw) &&
          !(stem.length > 3 && essay.toLowerCase().includes(stem))) {
        missedKeywords.push(kw);
      }
    }

    // ── Semantic Analysis (primary signal — async) ────────────────────────────
    let rawSemanticScore = await this._semanticScore(question, essay, sentenceEmbeddings);

    // ── Cross-model compatibility guard ─────────────────────────────────────
    // When essay is embedded by Python MiniLM (all-MiniLM-L6-v2) but the
    // question is embedded by Ollama nomic-embed-text, cosine similarity
    // collapses to ~0.00 because the two models have incompatible embedding
    // spaces. A cross-model cosine < 0.05 is indistinguishable from zero and
    // produces systematically incorrect DRIFT verdicts.
    // Fix: treat semanticScore < 0.05 as unreliable → null → fallback to keyword.
    // At the same time, if semantic is very low but keyword is high, use keyword
    // as the authoritative signal (BM25-style rescue).
    const semanticScore = (rawSemanticScore !== null && rawSemanticScore >= 0.05)
      ? rawSemanticScore
      : null;

    if (rawSemanticScore !== null && rawSemanticScore < 0.05 && sentenceEmbeddings.length > 0) {
      console.warn(
        `⚠️ TR Semantic: cross-model cosine=${rawSemanticScore.toFixed(3)} (MiniLM↔nomic incompatibility). ` +
        `Falling back to keyword score=${keywordScore.toFixed(2)} as authoritative signal.`
      );
    }

    // ── Verdict ─────────────────────────────────────────────────
    const { score, verdict, trBandFloor, usesSemantic } = this._toVerdict(semanticScore, keywordScore);

    // Apply discussion balance penalty if needed.
    // Cambridge: Discussion essay presenting only one view → max Band 5 TR.
    // We cap the floor here to 5.5 (not 5.0) to be conservative — the
    // essay still addresses the topic, it just fails the task structure.
    let finalTrBandFloor = trBandFloor;
    let finalVerdict = verdict;
    if (discussionPenaltyActive && trBandFloor > 5.5) {
      finalTrBandFloor = 5.5;
      finalVerdict = 'PARTIAL_DISCUSSION'; // distinct verdict for downstream logging
      console.warn(`⚠️ TR Discussion Penalty applied: original floor ${trBandFloor} → capped at 5.5 (only one view presented).`);
    }
    const method = semanticScore !== null
      ? (sentenceEmbeddings && sentenceEmbeddings.length > 0
          ? "hybrid_python_embeddings"
          : "hybrid_ollama_embeddings")
      : "keyword_only";

    console.log(
      ` TR [${method}] type=${taskType}: semantic=${semanticScore !== null ? semanticScore.toFixed(2) : "N/A"}, ` +
      `keyword=${keywordScore.toFixed(2)}, final=${score}, verdict=${finalVerdict}, cap=${finalTrBandFloor}` +
      (discussionPenaltyActive ? ' [DISCUSSION PENALTY ACTIVE]' : '')
    );

    return {
      relevance_score:        score,
      semantic_score:         semanticScore !== null ? parseFloat(semanticScore.toFixed(2)) : null,
      keyword_score:          parseFloat(keywordScore.toFixed(2)),
      parts_coverage:         partsCoverage,
      missed_keywords:        missedKeywords.slice(0, 10),
      question_keyword_count: allKeywords.size,
      tr_band_floor:          finalTrBandFloor,
      verdict:                finalVerdict,
      task_type:              taskType,
      discussion_balance:     discussionBalance,
      method
    };
  }
}

module.exports = new TopicRelevanceService();
