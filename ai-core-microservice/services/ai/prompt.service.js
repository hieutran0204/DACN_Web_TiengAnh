/**
 * name: prompt.service.js
 * description: Node 2 — Feedback Prompt Builder (Dual-Node Architecture).
 *   Builds the LLM prompt for the Feedback Generator.
 *   Scores are locked by ScoringEngine (Node 1) before this is called.
 *   The LLM's sole task: generate Cambridge Examiner-quality pedagogical feedback.
 *
 *   Key design changes vs previous version:
 *     - Persona: strict Cambridge IELTS Examiner (not a generic tutor)
 *     - Scaffolding: hard linguistic constraints (linguistic_principle required, argument preserved)
 *     - Feedback: evidence-based Examiner Report format (what/why/principle/next-step)
 *     - Word family repetition signal injected into LR context when detected
 */

const TASK1_TYPES = ['bar_chart', 'line_graph', 'pie_chart', 'table', 'process', 'map', 'mixed_chart', 'Task 1'];

// Task-type specific guidance (injected as context, not scoring instruction)
const taskGuidance = {
  bar_chart:   'This is a Task 1 bar chart. Note comparisons and superlatives.',
  line_graph:  'This is a Task 1 line graph. Note trends over time.',
  pie_chart:   'This is a Task 1 pie chart. Note proportions and composition.',
  table:       'This is a Task 1 table. Note significant numbers and categories.',
  process:     'This is a Task 1 process diagram. Note sequencing and passive voice usage.',
  map:         'This is a Task 1 map. Note spatial language and changes.',
  mixed_chart: 'This is a Task 1 mixed chart. Note synthesis across data sources.',
  opinion:              'Task 2 — Opinion. Student should maintain a clear, consistent position throughout.',
  discussion:           'Task 2 — Discussion. Student should address BOTH views before giving personal opinion.',
  problem_solution:     'Task 2 — Problem/Solution. Student should identify causes and propose concrete solutions.',
  cause_effect:         'Task 2 — Cause/Effect. Student should trace causal links clearly with examples.',
  advantage_disadvantage: 'Task 2 — Advantages/Disadvantages. Student should weigh both sides with balanced development.',
  two_part_question:    'Task 2 — Two-Part Question. BOTH sub-questions must be fully addressed.',
};

/**
 * JSON output template — band scores pre-filled from lockedScores (LLM cannot change them).
 * Field schema is intentionally more structured than the previous version to enforce
 * Examiner-Report format: every claim must have evidence, every scaffolding must have a principle.
 *
 * @param {Object} bd      - band_breakdown from lockedScores
 * @param {number} overall - overall_band from lockedScores
 * @returns {string} JSON template string
 */
const buildJSONTemplate = (bd, overall) => `{
  "overall_band": ${overall ?? 0},
  "band_breakdown": {
    "task_response": ${bd?.task_response ?? 0},
    "coherence_cohesion": ${bd?.coherence_cohesion ?? 0},
    "lexical_resource": ${bd?.lexical_resource ?? 0},
    "grammatical_range_accuracy": ${bd?.grammatical_range_accuracy ?? 0}
  },
  "feedback_vn": "Nhận xét tổng quát của giám khảo về bài viết (2-3 câu, trực tiếp và cụ thể — không chung chung)...",
  "evidence_based_justification_vn": {
    "task_response": "Giải thích ĐỊNH TÍNH (tuyệt đối KHÔNG nhắc đến số lượng từ): chỉ ra ý tưởng đã được phát triển sâu hay chưa, ví dụ có thuyết phục không...",
    "coherence_cohesion": "Giải thích ĐỊNH TÍNH (tuyệt đối KHÔNG khuyên thêm từ nối): đánh giá sự mạch lạc của luồng ý tưởng và cách nhóm ý vào các đoạn văn...",
    "lexical_resource": "Giải thích ĐỊNH TÍNH (tuyệt đối KHÔNG đếm số lượng từ vựng): đánh giá độ chính xác, ngữ cảnh sử dụng từ và sự đa dạng thực sự (không lặp từ)...",
    "grammatical_range_accuracy": "Giải thích ĐỊNH TÍNH (tuyệt đối KHÔNG đếm số lỗi): đánh giá khả năng kiểm soát câu phức và mức độ ảnh hưởng của lỗi tới việc truyền đạt ý..."
  },
  "advanced_vocabulary": [{"word": "...", "level": "C1/B2", "context": "Câu trong bài chứa từ này", "meaning_vn": "Nghĩa tiếng Việt", "why_effective": "Giải thích tại sao từ này hiệu quả trong ngữ cảnh này (collocation, register, precision)"}],
  "strengths": ["Điểm mạnh cụ thể 1 (có dẫn chứng từ bài)", "Điểm mạnh cụ thể 2 (có dẫn chứng từ bài)"],
  "weaknesses": ["Điểm yếu cụ thể 1 — nêu rõ vấn đề là gì và nó ảnh hưởng đến điểm số như thế nào", "Điểm yếu cụ thể 2..."],
  "recommendations_vn": [
    {
      "focus": "Tên khía cạnh cần cải thiện (VD: Phát triển ý, Thay thế Cliche)",
      "current_issue": "Trích dẫn 1 câu lỗi/thói quen hiện tại từ bài viết",
      "action": "Hành động cụ thể từng bước (tuyệt đối KHÔNG khuyên dùng từ nối cơ học hoặc template) và nêu kết quả mong đợi"
    }
  ],
  "scaffolding_suggestions": [
    {
      "original": "Câu gốc từ bài viết của học viên (copy chính xác)",
      "improved": "Phiên bản cải thiện — PHẢI giữ nguyên ý nghĩa/lập luận gốc, chỉ nâng cấp ngôn ngữ",
      "linguistic_principle": "Tên nguyên tắc ngôn ngữ học áp dụng (ví dụ: Passive Voice, Nominalization, Relative Clause, Hedging Language, Concession Structure...)",
      "explanation_vn": "Giải thích RÕ RÀNG: câu gốc sai/yếu ở điểm nào (lỗi gì, thiếu gì), câu cải thiện tốt hơn ở điểm nào (cấu trúc mới nào được dùng, tại sao nó hiệu quả hơn với Cambridge examiner)"
    }
  ],
  "grammar_errors_found": ["Loại lỗi 1 (từ CONFIRMED ERRORS)", "Loại lỗi 2"],
  "detailed_errors": [
    {
      "sentence_index": 0,
      "sentence": "Câu gốc chứa lỗi (copy chính xác từ CONFIRMED ERRORS)",
      "error_type": "GRAMMATICAL | STYLISTIC | LEXICAL | COHERENCE",
      "severity": "HIGH | MEDIUM | LOW",
      "what_is_wrong_vn": "Chỉ ra chính xác lỗi gì: SVA sai ở đâu, tense sai ở đâu, từ nào dùng sai...",
      "why_it_matters_vn": "Tại sao lỗi này ảnh hưởng đến điểm số (Cambridge examiner sẽ trừ điểm ở tiêu chí nào, tại sao)",
      "suggestion_vn": "Cách sửa cụ thể và ngắn gọn"
    }
  ]
}`;

/**
 * Build the Cambridge Examiner-style feedback prompt for Node 2 (LLM Feedback Generator).
 *
 * Design philosophy:
 *   - Persona: a strict but constructive Cambridge IELTS Examiner, not a generic AI tutor.
 *   - All scores are pre-filled (LLM cannot change them). LLM only explains and teaches.
 *   - Scaffolding has hard linguistic constraints to prevent generic/hallucinated rewrites.
 *   - Feedback structure mirrors the Cambridge Examiner Report format.
 *   - Word family repetition signal is surfaced when detected by RuleBasedService.
 *
 * @param {string} essay
 * @param {string} question
 * @param {string} type          - Essay type (e.g. 'ielts-task2', 'opinion')
 * @param {string} ragContext    - Combined student history + knowledge base context
 * @param {Object} lockedScores  - Output from ScoringEngine.computeScores()
 * @param {Array}  annotations   - Sentence-level annotations from FeatureBuilder
 * @param {Object} featureMap    - Full feature map (cliché + coherence + word family data)
 * @returns {string} Prompt string ready for LLM invocation
 */
function buildFeedbackPrompt(
  essay,
  question     = '',
  type         = 'ielts-task2',
  ragContext   = '',
  lockedScores = {},
  annotations  = [],
  featureMap   = {}
) {
  const { band_breakdown: bd, overall_band, scoring_reasons = [] } = lockedScores;

  // ── Confirmed grammar errors only (no hallucination surface) ─────────────
  const confirmedErrors = (annotations || [])
    .filter(ann => ann.annotations && ann.annotations.length > 0)
    .map(ann => ({
      sentence_index: ann.sentence_index,
      sentence:       ann.sentence,
      errors: ann.annotations.map(e => ({
        label:          e.label,
        severity:       e.severity,
        span:           e.span,
        suggestion:     e.suggestion,
        explanation_vn: e.explanation_vn
      }))
    }));

  // ── Confirmed advanced words & collocations only (no hallucination surface) ─────────────
  const lessCommonWords = (featureMap.lexical_resource?.less_common_words || []).slice(0, 20);
  const collocations    = (featureMap.lexical_resource?.collocations || []).slice(0, 10);
  const coherenceIssues = featureMap.cohesion?.coherence_issues || [];
  const clicheDetected  = featureMap.cohesion?.cliche_detected  || [];
  const clicheDensity   = featureMap.cohesion?.cliche_density   || 0;

  // ── Phase 2: Embedding-detected collocations (CollocationEmbeddingService) ──
  // These chunks were confirmed by vector similarity against a Cambridge corpus.
  // They are higher-quality signals than the hardcoded collocations list.
  const embeddingCollocations = (featureMap.lexical_resource?.top_collocations_embedding || []).slice(0, 10);
  // Merge embedding hits with rule-based collocations; embedding takes priority
  const confirmedCollocations = embeddingCollocations.length > 0 ? embeddingCollocations : collocations;

  // ── Phase 2: Discourse Graph context (DiscourseGraphService) ─────────────────
  // Provides the LLM with the argument structure map of the essay so it can give
  // specific CC feedback about WHICH claims are unsupported rather than vague advice.
  const discourseGraph = featureMap.discourse_graph || {};
  const graphStats     = discourseGraph.graph_stats || {};
  const graphNodes     = discourseGraph.nodes || [];
  const graphEdges     = discourseGraph.edges || [];
  const hasGraph       = graphNodes.length > 0;
  const discourseGraphCtx = hasGraph
    ? `\n--- DISCOURSE ARGUMENT GRAPH (Phase 2 Analysis) ---\n` +
      `Graph stats: ${graphStats.claims || 0} claims, ${graphStats.evidence_examples || 0} evidence/examples, ` +
      `${graphStats.counters || 0} counter-arguments, ${graphStats.supported_claims || 0} supported claims, ${graphStats.unsupported_claims || 0} unsupported.\n` +
      `Nodes (ideas identified):\n${graphNodes.slice(0, 8).map(n => `  [${n.type}] "${n.text}"`).join('\n')}\n` +
      `Edges (logical relations):\n${graphEdges.slice(0, 8).map(e => {
        const from = graphNodes.find(n => n.id === e.from)?.text?.slice(0, 30) || e.from;
        const to   = graphNodes.find(n => n.id === e.to)?.text?.slice(0, 30) || e.to;
        return `  "${from}" --[${e.relation}]--> "${to}"`;
      }).join('\n')}\n` +
      (graphStats.unsupported_claims > 0
        ? `⚠️ UNSUPPORTED CLAIMS DETECTED: ${graphStats.unsupported_claims} claim(s) have no supporting evidence or example edge. Reference this in your CC feedback.\n`
        : '') +
      (graphStats.has_counter_rebuttal
        ? `✅ COUNTER-REBUTTAL STRUCTURE PRESENT: Student acknowledges opposing view and provides rebuttal. Reference this as a CC strength.\n`
        : '') +
      `--- END DISCOURSE GRAPH ---`
    : '';

  // ── Word Family Diversity signal (for LR feedback context) ───────────────
  // When word_family_ratio < 0.55, the student is repeating the same word families
  // (e.g. economic/economy/economically). This is surfaced as a context signal so
  // the LLM can reference it precisely in the LR justification.
  const wordFamilyRatio = featureMap.lexical_resource?.word_family_ratio ?? null;
  const wordFamilyCount = featureMap.lexical_resource?.word_family_count ?? null;
  const wordFamilyCtx = (wordFamilyRatio !== null && wordFamilyRatio < 0.55)
    ? `\n⚠️ VOCABULARY REPETITION DETECTED: Word family ratio = ${wordFamilyRatio} (only ${wordFamilyCount} unique word families across all academic tokens). The student is repeating the same word family forms (e.g. "economic", "economy", "economically") rather than using genuinely diverse vocabulary. Cambridge examiners call this "limited range". Reference this finding specifically in your LR justification.`
    : '';

  const taskCtx = taskGuidance[type] || (TASK1_TYPES.includes(type) ? 'IELTS Task 1 response.' : 'IELTS Task 2 essay.');

  return `You are a strict but constructive Cambridge IELTS Examiner with 15 years of experience marking Writing papers. You have just scored this student's essay using a deterministic algorithmic engine. Your task is to write a formal Examiner Report in Vietnamese that explains the scores and teaches the student how to improve.

CRITICAL RULES (violating any of these is unacceptable):
1. SCORES ARE LOCKED. Do NOT modify any band score. They are mathematically fixed by the scoring engine.
2. CONFIRMED ERRORS ONLY. Only reference grammar errors from the CONFIRMED ERRORS section. Do NOT invent or hallucinate grammar mistakes not listed there.
3. CONFIRMED VOCABULARY ONLY. Only praise vocabulary from the CONFIRMED ADVANCED WORDS list. Do NOT add words absent from that list.
4. SCAFFOLDING CONSTRAINTS (most important rule for teaching quality):
   - The "original" field must be an exact copy of a sentence from the essay.
   - The "improved" sentence MUST preserve the original argument/meaning — do NOT change the student's idea.
   - The "improved" sentence must apply a verifiable, named grammatical structure (passive voice, inversion, cleft sentence, nominalization, concession clause, hedging, etc.).
   - The "linguistic_principle" field must name the specific structure (e.g. "Concession + Main Clause", "Passive Voice for Objectivity", "Nominalization for Academic Register", "Fronted Adverbial for Emphasis").
   - The "explanation_vn" must state: (a) exactly what was weak in the original sentence, (b) exactly what linguistic technique was applied in the improved version, (c) why Cambridge examiners reward this specific technique under GRA or LR.
   - DO NOT write an "improved version" that simply adds more words or synonyms. Every structural change must be purposeful and explicitly named.
5. FIND GENUINE STRENGTHS. Identify at least 1-2 real strengths, citing specific evidence from the essay (quote or reference specific words/sentences).
6. NO STATISTICS REQUIREMENT. Do NOT suggest the student needs to provide real-world statistics, research citations, or exact percentages. IELTS Writing evaluates English language proficiency, not academic knowledge.
7. EXAMINER TONE. Write as a Cambridge examiner writes in official band score reports: precise, evidence-based, no vague praise ("good effort", "well done", "this is good"). Every claim must be supported by a specific observation from this essay.
8. PEDAGOGICAL TRANSLATION (CRITICAL). The 'Algorithmic scoring rationale' provided below is raw system data (e.g., word counts, error rates, vocab counts). DO NOT expose these raw metrics to the student. For example, never say "You wrote 396 words", "You used 27 word families", or "You didn't use enough linking words". Instead, translate these metrics into qualitative Cambridge Band Descriptor language.
   - Word count > 350 -> "Ideas are fully extended and well-supported."
   - High advanced vocab count -> "Displays precision and flexibility in vocabulary."
   - Low linking words -> "Logical progression between ideas needs to be clearer."
   Focus on the *quality* of the writing, not the *quantity* of the metrics.
9. ANTI-MECHANICAL ADVICE (CRITICAL). Do NOT advise students to use transition words (furthermore, moreover, in addition) to improve cohesion. This creates mechanical cohesion. Advise them to use pronoun referencing (this, these, such) or logical flow. Do NOT advise them to use template openers ("I am of the view that", "It is widely believed that"). Advise them to state their opinion directly and naturally.

Task context: ${taskCtx}

--- LOCKED BAND SCORES (DO NOT MODIFY) ---
Task Response (TR):                 ${bd?.task_response ?? 'N/A'}
Coherence & Cohesion (CC):          ${bd?.coherence_cohesion ?? 'N/A'}
Lexical Resource (LR):              ${bd?.lexical_resource ?? 'N/A'}
Grammatical Range & Accuracy (GRA): ${bd?.grammatical_range_accuracy ?? 'N/A'}
Overall Band:                       ${overall_band ?? 'N/A'}
--- END LOCKED SCORES ---

--- CONFIRMED GRAMMAR ERRORS (reference ONLY these — do not add others) ---
${confirmedErrors.length > 0
    ? JSON.stringify(confirmedErrors, null, 2)
    : 'No confirmed grammar errors detected. GRA justification should reflect this positively — note the accuracy and grammatical control demonstrated.'}
--- END GRAMMAR ERRORS ---

--- CONFIRMED LEXICAL CHUNKS & COLLOCATIONS (praise these chunks — detected by embedding similarity) ---
${confirmedCollocations.length > 0
    ? confirmedCollocations.join(', ')
    : 'No confirmed B2+ collocations or lexical chunks detected. LR justification should note the lack of natural academic word combinations.'}
--- END COLLOCATIONS ---

--- CONFIRMED ADVANCED VOCABULARY (Less Common Lexical Items) ---
${lessCommonWords.length > 0
    ? lessCommonWords.join(', ')
    : 'No confirmed C1/C2 advanced words detected. LR justification should note limited use of less common vocabulary.'}
--- END VOCABULARY ---
${discourseGraphCtx}
${wordFamilyCtx}${coherenceIssues.length > 0 ? `
--- COHERENCE & LOGIC ISSUES (detected by Graph Engine) ---
${coherenceIssues.map(i => `  • [${i.type}] ${i.message}`).join('\n')}
Instruction: Reference these issues in your CC justification. If any issue seems incorrect given the essay context, you may note it, but do not ignore the overall pattern.
--- END COHERENCE ISSUES ---
` : ''}${clicheDetected.length > 0 ? `
--- CLICHÉ / TEMPLATE PHRASES DETECTED ---
${clicheDetected.slice(0, 15).map(c => `  • [${c.tier}] "${c.phrase}" (×${c.frequency})`).join('\n')}
Density: ${clicheDensity}/100 words. Cambridge examiners recognize these phrases immediately and they signal lack of originality. Reference this in your CC and LR justification.
--- END CLICHÉ REPORT ---
` : ''}${ragContext ? `
--- PERSONALIZED CONTEXT (student history + IELTS knowledge base) ---
${ragContext}
--- END CONTEXT ---
` : ''}
Question: ${question || '(No question provided)'}
Original Essay:
"""${essay}"""

Return ONLY valid JSON matching this exact structure (band scores are pre-filled — keep them exactly as shown):
${buildJSONTemplate(bd, overall_band)}`.trim();
}

module.exports = { buildFeedbackPrompt };
