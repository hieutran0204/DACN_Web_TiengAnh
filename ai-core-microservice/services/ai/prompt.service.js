/**
 * services/ai/prompt.service.js
 *
 * 🤖 Prompt Builder — Injects GraphRAG context, Feature Map, Annotations,
 * and HARD CAPS into IELTS scoring prompts.
 */

const TASK1_TYPES = ["bar_chart", "line_graph", "pie_chart", "table", "process", "map", "mixed_chart", "Task 1"];

const specializedGuidance = {
  // Task 1
  bar_chart:   "Focus on comparing data, trends, and key features. Look for superlatives and comparative structures.",
  line_graph:  "Focus on trends over time (increase, decrease, fluctuate). Look for time expressions.",
  pie_chart:   "Focus on proportions and percentages. Look for language of fractions and composition.",
  table:       "Focus on significant numbers and comparisons. Group information logically.",
  process:     "Focus on sequencing (first, then, subsequently) and passive voice. Describe stages clearly.",
  map:         "Focus on spatial language (north, south, adjacent) and changes (demolished, constructed, replaced).",
  mixed_chart: "Focus on synthesizing data from multiple sources. Ensure connections between charts are made if relevant.",
  // Task 2
  opinion:              "Focus on clear opinion/position throughout. 'To what extent do you agree...'",
  discussion:           "Focus on discussing BOTH views and then giving own opinion. Balance is key.",
  problem_solution:     "Focus on identifying problems clearly and proposing practical solutions.",
  cause_effect:         "Focus on causal links (because, consequently, lead to). Analyze impacts.",
  advantage_disadvantage: "Focus on weighing pros and cons. Use contrasting language.",
  two_part_question:    "Ensure BOTH questions are answered fully. Logical paragraphing for each part.",
};

const JSON_TEMPLATE = `{
  "overall_band": 7.0,
  "band_breakdown": {
    "task_response": 7,
    "coherence_cohesion": 7,
    "lexical_resource": 7,
    "grammatical_range_accuracy": 7
  },
  "feedback_vn": "Nhận xét tổng quát...",
  "evidence_based_justification_vn": {
    "task_response": "Lý giải dựa trên luận điểm và logic...",
    "coherence_cohesion": "Phân tích luồng logic (Diễn dịch/Quy nạp) và sự mạch lạc...",
    "lexical_resource": "Đánh giá vốn từ và sự chính xác...",
    "grammatical_range_accuracy": "Đánh giá độ đa dạng cấu trúc và các lỗi nghiêm trọng..."
  },
  "advanced_vocabulary": [{"word": "...", "level": "C1", "context": "...", "meaning_vn": "...", "reason": "Tại sao dùng từ này lại tốt?"}],
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "weaknesses": ["Điểm yếu 1", "Điểm yếu 2"],
  "recommendations_vn": "Lời khuyên mang tính định hướng...",
  "scaffolding_suggestions": [
    {
      "original": "Câu gốc có vấn đề",
      "improved": "Cách sửa gợi ý",
      "logic": "Giải thích tư duy đằng sau cách sửa này"
    }
  ],
  "grammar_errors_found": ["Lỗi 1", "Lỗi 2"]
}`;

/**
 * Build the final prompt with GraphRAG context injected
 */
function buildWritingPrompt(essay, question = "", type = "ielts-task2", graphRagContext = "", featureMap = {}, annotations = [], hardCaps = {}) {
  const isTask1 = TASK1_TYPES.includes(type) || type.toLowerCase().includes("task 1");
  const guidance = specializedGuidance[type] || "";
  const taskLabel = isTask1 ? "Task 1" : "Task 2";

  return `
You are an expert IELTS Writing Tutor and Examiner (Band 9.0). Your goal is not just to grade, but to provide **Scaffolding Feedback** that helps students understand the **Reasoning** behind high-level writing.

--- REASONING LAYER INSTRUCTIONS ---
1. **Structural Recognition**: Recognize both Deductive (General-to-Specific) and Inductive (Specific-to-General) paragraph structures. Do not penalize if a Topic Sentence is at the end if the logic flows inductively.
2. **Coherence Analysis**: Use the Feature Map to detect "Lexical Chains". Check if the student maintains a consistent theme or if there are "Sudden Logic Jumps".
3. **Scaffolding Feedback**: In the 'scaffolding_suggestions' section, don't just fix grammar. Provide a "Transformation" that elevates the logic. (e.g., suggest a Summary Noun to bridge two sentences).
4. **Logical Fallacies**: Identify if the student uses circular reasoning, overgeneralization, or weak causal links.
5. **Tolerance & Precision**: Be highly tolerant of valid alternative spellings (UK vs US), hyphenations, and advanced vocabulary. DO NOT penalize correct but uncommon words. If a word is used correctly in context, praise it under Lexical Resource rather than marking it as a weakness.
6. **Veto Power over Rule-Based Errors**: You will receive a list of "ANNOTATIONS" detected by a simple rule-based layer. **You have the final authority to reject these errors**. If the rule-based layer flags a "Sentence Fragment" or "Grammar Error" but you perceive it as a technically correct complex structure (e.g., a long dependent clause correctly followed by a comma and a main clause), **discard the error** and do not include it in your final feedback. Only include errors that you personally verify as objective mistakes.
7. **Constructive Evaluation**: Do not be overly harsh on minor slips if the overall meaning is clear. IELTS grading should reward what the student can do, rather than just penalizing mistakes. Balance linguistic nuance against strict benchmarks.
--- END REASONING LAYER ---

--- PRE-PROCESSED DATA (FACTS) ---
FEATURE MAP: ${JSON.stringify(featureMap, null, 2)}
ANNOTATED ESSAY: ${JSON.stringify(annotations, null, 2)}
--- END PRE-PROCESSED DATA ---

--- HARD CAPS (ABSOLUTE RULES) ---
- TR MAX: ${hardCaps.task_response} | CC MAX: ${hardCaps.coherence_cohesion} | LR MAX: ${hardCaps.lexical_resource} | GRA MAX: ${hardCaps.grammatical_range_accuracy}
Reasons: ${hardCaps.reasons ? hardCaps.reasons.join(', ') : 'None'}
--- END HARD CAPS ---

${graphRagContext ? `--- STUDENT HISTORY & KNOWLEDGE ---\n${graphRagContext}\n` : ""}

INSTRUCTIONS:
- Return ONLY valid JSON matching the exact structure below.
- Component scores MUST be whole numbers.
- Ensure 'feedback_vn' and 'evidence_based_justification_vn' are professional and encouraging.

Topic: ${question}
Original Essay:
"""${essay}"""

Required JSON structure:
${JSON_TEMPLATE}
`.trim();
}

module.exports = { buildWritingPrompt };
