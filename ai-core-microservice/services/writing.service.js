const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.2,
    topP: 0.95,
    topK: 40,
  }
});

const extractJSON = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}") + 1;
    if (start === -1 || end === 0) throw new Error("No JSON");
    const jsonStr = cleaned.substring(start, end);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Parse JSON lỗi:", text.substring(0, 800));
    return { error: "AI không trả JSON hợp lệ", raw: text.substring(0, 1000) };
  }
};

const analyzeWriting = async (essay, question = "", type = "ielts-task2") => {
  // Determine prompts based on task type and specific question category
  let systemPrompt = "";
  let jsonStructure = "";
  
  const specializedPrompts = {
    // TASK 1
    "bar_chart": "Focus on comparing data, trends, and key features. Look for superlatives and comparative structures.",
    "line_graph": "Focus on trends over time (increase, decrease, fluctuate). Look for time expressions.",
    "pie_chart": "Focus on proportions and percentages. Look for language of fractions and composition.",
    "table": "Focus on significant numbers and comparisons. Group information logically.",
    "process": "Focus on sequencing (first, then, subsequently) and passive voice. Describe stages clearly.",
    "map": "Focus on spatial language (north, south, adjacent) and changes (demolished, constructed, replaced).",
    "mixed_chart": "Focus on synthesizing data from multiple sources. Ensure connections between charts are made if relevant.",
    
    // TASK 2
    "opinion": "Focus on clear opinion/position throughout. 'To what extent do you agree...'",
    "discussion": "Focus on discussing BOTH views and then giving own opinion. Balance is key.",
    "problem_solution": "Focus on identifying problems clearly and proposing practical solutions.",
    "cause_effect": "Focus on causal links (because, consequently, lead to). Analyze impacts.",
    "advantage_disadvantage": "Focus on weighing pros and cons. Use contrasting language.",
    "two_part_question": "Ensure BOTH questions are answered fully. Logical paragraphing for each part."
  };

  const specificGuidance = specializedPrompts[type] || "";

  if (["bar_chart", "line_graph", "pie_chart", "table", "process", "map", "mixed_chart", "Task 1"].includes(type) || type.toLowerCase().includes("task 1")) {
     // TASK 1 SPECIFIC
     systemPrompt = `Bạn là chuyên gia IELTS band 9.0. Hãy chấm bài Writing Task 1 (${type}) cực chuẩn.\n${specificGuidance}`;
     jsonStructure = `
{
  "overall_band": 7.0,
  "band_breakdown": {
    "task_response": 7.0,
    "coherence_cohesion": 7.5,
    "lexical_resource": 7.0,
    "grammatical_range_accuracy": 6.5
  },
  "feedback_vn": "Bài viết mô tả rõ xu hướng chính, nhưng cần so sánh số liệu chi tiết hơn.",
  
  "advanced_vocabulary": [
    {"word": "illustrate", "level": "B2", "meaning_vn": "minh họa"},
    {"word": "substantial", "level": "C1", "meaning_vn": "đáng kể"}
  ],
  "corrected_essay": "The chart illustrates the changes...",
  "strengths": ["Clear overview", "Accurate data"],
  "weaknesses": ["Lack of comparison", "Minor grammar errors"],
   "recommendations_vn": "Nên dùng cấu trúc so sánh như 'User higher than...' thay vì chỉ liệt kê."
}`;
  } else {
     // TASK 2 SPECIFIC
     systemPrompt = `Bạn là chuyên gia IELTS band 9.0. Hãy chấm bài Writing Task 2 (${type}) cực chuẩn.\n${specificGuidance}`;
     jsonStructure = `
{
  "overall_band": 7.0,
  "band_breakdown": {
    "task_response": 7.0,
    "coherence_cohesion": 7.5,
    "lexical_resource": 7.0,
    "grammatical_range_accuracy": 6.5
  },
  "feedback_vn": "Bài viết có lập luận rõ ràng, từ vựng tốt nhưng còn lặp từ.",
  
  "advanced_vocabulary": [
    {"word": "outweigh", "level": "C1", "meaning_vn": "vượt trội hơn"},
    {"word": "crucial", "level": "B2", "meaning_vn": "quan trọng"}
  ],
  "corrected_essay": "In recent years...",
  "strengths": ["Clear position", "Logical structure"],
  "weaknesses": ["Word repetition", "Limited complex structures"],
  "recommendations_vn": "Hãy phát triển ý sâu hơn ở đoạn thân bài 2."
}`;
  }

  const prompt = `
${systemPrompt}

Phân tích bài viết sau và TRẢ VỀ CHỈ JSON ĐÚNG CẤU TRÚC DƯỚI ĐÂY:

Topic: ${question}
Type: ${type}
Essay:
"""${essay}"""

Mẫu JSON trả về (BẮT BUỘC):
${jsonStructure}

Thêm các trường phân tích chi tiết:
- collocations (list string)
- academic_words (list string)
- repeated_words (list string)
- grammar_errors_found (list object {error, type})
- word_count (number)
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    console.log("--- AI RAW OUTPUT START ---");
    console.log(text);
    console.log("--- AI RAW OUTPUT END ---");
    const data = extractJSON(text);
    if (data && !data.error) {
      data.generated_at = new Date().toISOString();
      data.type = type;
    }
    return data;
  } catch (err) {
    return { error: "Gemini error", details: err.message };
  }
};

module.exports = { analyzeWriting };
