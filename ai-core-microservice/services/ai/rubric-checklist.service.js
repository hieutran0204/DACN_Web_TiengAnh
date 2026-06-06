/**
 * name: rubric-checklist.service.js
 * description: TR Rubric Checklist Service — Phase 1 of Examiner Simulation Model.
 *
 * Replaces the coarse word-count-based TR development score with a structured
 * Cambridge-rubric checklist. Each checklist item maps directly to a Band Descriptor.
 *
 * Design:
 *   - One LLM call per essay (not per sentence), asking the model to tick
 *     each rubric item YES/NO with a quoted evidence fragment from the essay.
 *   - Score = weighted ratio of YES items, calibrated to IELTS TR bands 5–8.
 *   - Provider-agnostic: reads AI_PROVIDER env var to choose Gemini or Ollama.
 *   - The checklist result is injected into feature_map.task_response so
 *     ScoringEngine._computeTR() can use it without breaking its interface.
 */

const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatOllama }             = require('@langchain/ollama');

// ── Rubric Checklists keyed by essay type ────────────────────────────────────
// Each item has a weight (1 = standard, 2 = critical for band gate).
// Weights reflect Cambridge rubric emphasis.
const RUBRIC_CHECKLISTS = {
  opinion: [
    { id: 'position_stated',    weight: 2, question: 'Is a clear personal position/opinion stated in the introduction or early in the essay?' },
    { id: 'position_sustained', weight: 2, question: 'Is the position maintained consistently throughout the entire essay without contradiction?' },
    { id: 'argument_1',         weight: 1, question: 'Is there at least one main supporting argument clearly stated (not just implied)?' },
    { id: 'argument_2',         weight: 1, question: 'Is there a second distinct supporting argument (different topic/angle from argument 1)?' },
    { id: 'evidence_or_example',weight: 2, question: 'Is at least one argument developed with a concrete example, statistic, or elaboration?' },
    { id: 'conclusion_restates',weight: 1, question: 'Does the conclusion restate the position and summarize the key arguments?' },
  ],
  discussion: [
    { id: 'view_1_presented',   weight: 2, question: 'Is the first viewpoint/side of the discussion clearly presented with at least one reason?' },
    { id: 'view_2_presented',   weight: 2, question: 'Is the second (opposing) viewpoint clearly presented with at least one reason?' },
    { id: 'personal_opinion',   weight: 2, question: 'Is the student\'s own opinion clearly stated (not just implied)?' },
    { id: 'evidence_present',   weight: 1, question: 'Is at least one view supported with a specific example or elaboration?' },
    { id: 'conclusion_clear',   weight: 1, question: 'Is there a clear conclusion that wraps up both views and the personal stance?' },
  ],
  problem_solution: [
    { id: 'problem_identified',  weight: 2, question: 'Is the main problem (or cause) clearly identified and explained?' },
    { id: 'solution_proposed',   weight: 2, question: 'Is at least one concrete, specific solution proposed (not vague like "the government should do more")?' },
    { id: 'solution_elaborated', weight: 1, question: 'Is the proposed solution elaborated with how it works or why it would be effective?' },
    { id: 'second_point',        weight: 1, question: 'Is there a second distinct problem or solution addressed?' },
    { id: 'conclusion_present',  weight: 1, question: 'Is there a conclusion that summarizes the problem and solution?' },
  ],
  cause_effect: [
    { id: 'cause_stated',        weight: 2, question: 'Is at least one clear cause of the issue stated and explained?' },
    { id: 'effect_stated',       weight: 2, question: 'Is at least one clear effect or consequence stated and explained?' },
    { id: 'causal_link',         weight: 2, question: 'Is there a clear logical link (causal chain) connecting the cause to the effect?' },
    { id: 'second_pair',         weight: 1, question: 'Is there a second cause-effect pair addressed?' },
    { id: 'conclusion_present',  weight: 1, question: 'Is there a conclusion that synthesizes the causes and effects?' },
  ],
  advantage_disadvantage: [
    { id: 'advantage_stated',    weight: 2, question: 'Is at least one advantage clearly stated and explained?' },
    { id: 'disadvantage_stated', weight: 2, question: 'Is at least one disadvantage clearly stated and explained?' },
    { id: 'both_sides_developed',weight: 2, question: 'Are BOTH advantages and disadvantages developed with some elaboration (not just listed)?' },
    { id: 'overall_stance',      weight: 1, question: 'Is there an overall stance or conclusion about whether advantages outweigh disadvantages?' },
  ],
  two_part_question: [
    { id: 'part1_answered',      weight: 2, question: 'Is the FIRST sub-question of the task fully and directly answered?' },
    { id: 'part2_answered',      weight: 2, question: 'Is the SECOND sub-question of the task fully and directly answered?' },
    { id: 'part1_developed',     weight: 1, question: 'Is the answer to the first sub-question developed with reasons or examples?' },
    { id: 'part2_developed',     weight: 1, question: 'Is the answer to the second sub-question developed with reasons or examples?' },
    { id: 'conclusion_present',  weight: 1, question: 'Is there a clear conclusion?' },
  ],
};

// Fallback generic checklist for unknown/Task 1 types
const GENERIC_CHECKLIST = [
  { id: 'task_addressed',     weight: 2, question: 'Does the essay directly address the task or question?' },
  { id: 'main_point_clear',   weight: 2, question: 'Is the main point or overview clearly communicated?' },
  { id: 'detail_provided',    weight: 1, question: 'Are supporting details or sub-points provided?' },
  { id: 'conclusion_present', weight: 1, question: 'Is there a clear closing statement?' },
];

// ── Band mapping from checklist ratio ────────────────────────────────────────
// ratio = sum(weight of YES items) / sum(all weights)
// Phase 2 Recalibration (2026-06-03):
// Root cause of TR inflation: ratio=1.00 (LLM ticks all boxes) → score=7.5 even for Band 5 essays.
// Cambridge TR Band 7.5 requires "fully develops all parts of the task" — surface checklist completion
// is not sufficient. Tighten thresholds so that a fully-ticked generic checklist gives 7.0, not 7.5.
// Only genuinely deep essays with almost all items ticked (≥0.95) earn the 7.5 baseline.
const _ratioBandMap = (ratio) => {
  if (ratio >= 0.95) return { score: 7.5, label: 'All rubric criteria fully met with depth' };
  if (ratio >= 0.80) return { score: 7.0, label: 'Most rubric criteria well met' };
  if (ratio >= 0.65) return { score: 6.5, label: 'Core rubric criteria met, some gaps' };
  if (ratio >= 0.50) return { score: 6.0, label: 'Rubric partially met' };
  if (ratio >= 0.35) return { score: 5.5, label: 'Rubric weakly met, key criteria missing' };
  return { score: 5.0, label: 'Multiple rubric criteria not met' };
};

class RubricChecklistService {
  constructor() {
    const provider = process.env.AI_PROVIDER || 'ollama';

    if (provider === 'ollama') {
      const modelName = process.env.MACRO_MODEL_NAME || 'qwen2.5:7b';
      this.model = new ChatOllama({
        model:       modelName,
        baseUrl:     process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        temperature: 0,
        format:      'json',
        num_ctx:     4096,
        timeout:     120000,
      });
      console.log(`📋 RubricChecklistService: Using Ollama model: ${modelName}`);
    } else {
      this.model = new ChatGoogleGenerativeAI({
        model:       'gemini-2.0-flash',
        apiKey:      process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY,
        temperature: 0,
      });
      console.log(`📋 RubricChecklistService: Using Google Gemini (gemini-2.0-flash)`);
    }
  }

  /**
   * Normalize essay type string from various pipeline formats
   * to a known checklist key.
   *
   * @param {string} type
   * @returns {string} normalized key
   */
  _normalizeType(type) {
    if (!type) return 'generic';
    const t = type.toLowerCase().replace(/[-\s]/g, '_');
    if (t.includes('opinion') || t.includes('agree') || t.includes('disagree')) return 'opinion';
    if (t.includes('discussion') || t.includes('discuss')) return 'discussion';
    if (t.includes('problem') || t.includes('solution')) return 'problem_solution';
    if (t.includes('cause') || t.includes('effect') || t.includes('reason')) return 'cause_effect';
    if (t.includes('advantage') || t.includes('disadvantage')) return 'advantage_disadvantage';
    if (t.includes('two_part') || t.includes('two-part') || t.includes('double')) return 'two_part_question';
    return 'generic';
  }

  /**
   * Run the rubric checklist for a given essay and type.
   * Makes a single LLM call with all checklist items in one prompt.
   *
   * @param {string} essay     - Full essay text
   * @param {string} question  - The exam question/task prompt
   * @param {string} type      - Essay type string
   * @returns {Promise<{
   *   checklist_score: number,   // 5.0 – 7.5, to be injected as TR signal
   *   checklist_ratio: number,   // 0.0 – 1.0
   *   checklist_items: Array,    // [{id, checked, evidence}]
   *   checklist_label: string,
   *   type_used: string
   * }>}
   */
  async evaluate(essay, question, type) {
    const normalizedType = this._normalizeType(type);
    const checklist = RUBRIC_CHECKLISTS[normalizedType] || GENERIC_CHECKLIST;

    // Build numbered question list for the prompt
    const questionList = checklist
      .map((item, idx) => `${idx + 1}. [${item.id}] ${item.question}`)
      .join('\n');

    const prompt = `You are a strict Cambridge IELTS Task 2 examiner.

TASK: Evaluate the following essay against the rubric checklist. For each question, answer YES or NO based ONLY on what is explicitly present in the essay. Do NOT infer or assume — if it is not clearly written, answer NO.

EXAM QUESTION:
"${question || 'Not provided'}"

ESSAY:
"""
${essay}
"""

RUBRIC CHECKLIST (Essay type: ${normalizedType}):
${questionList}

Return ONLY valid JSON in this exact format:
{
  "results": [
    {"id": "position_stated", "checked": true, "evidence": "exact quote from essay or empty string if NO"},
    ...
  ]
}

Rules:
- "checked" must be a boolean (true = YES, false = NO)
- "evidence" must be a direct quote from the essay (max 20 words) when checked=true, or "" when checked=false
- Return ALL ${checklist.length} items in the SAME ORDER as the checklist above`;

    try {
      console.log(`📋 RubricChecklist: Evaluating [${normalizedType}] with ${checklist.length} criteria...`);
      const response = await this.model.invoke(prompt);
      const raw = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

      // Extract JSON safely
      const jsonMatch = raw.replace(/```json|```/g, '').trim().match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in LLM response');

      const parsed = JSON.parse(jsonMatch[0]);
      const results = Array.isArray(parsed.results) ? parsed.results : [];

      // Map LLM results back to checklist items
      const enrichedItems = checklist.map(item => {
        const found = results.find(r => r.id === item.id);
        return {
          id:       item.id,
          weight:   item.weight,
          question: item.question,
          checked:  found ? Boolean(found.checked) : false,
          evidence: found?.evidence || '',
        };
      });

      // Compute weighted ratio
      const totalWeight = checklist.reduce((sum, item) => sum + item.weight, 0);
      const yesWeight   = enrichedItems
        .filter(item => item.checked)
        .reduce((sum, item) => sum + item.weight, 0);
      const ratio = totalWeight > 0 ? yesWeight / totalWeight : 0;

      const { score, label } = _ratioBandMap(ratio);

      console.log(`📋 RubricChecklist: ${normalizedType} → ratio=${ratio.toFixed(2)}, score=${score} (${label})`);

      return {
        checklist_score: score,
        checklist_ratio: parseFloat(ratio.toFixed(3)),
        checklist_items: enrichedItems,
        checklist_label: label,
        type_used:       normalizedType,
      };
    } catch (err) {
      console.warn(`⚠️ RubricChecklist failed (non-fatal): ${err.message}`);
      // Graceful fallback: return neutral mid-band score
      return {
        checklist_score: 6.0,
        checklist_ratio: 0.5,
        checklist_items: [],
        checklist_label: 'Checklist unavailable (fallback)',
        type_used:       normalizedType,
      };
    }
  }
}

module.exports = new RubricChecklistService();
