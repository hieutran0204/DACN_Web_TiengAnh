const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Khởi tạo Gemini (dùng key từ env)
 */
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Model nhanh, rẻ

/**
 * Chấm điểm Writing: Input essay → Output score (0-9) + feedback
 */
const scoreWriting = async (essayText) => {
  const prompt = `
    Bạn là giám khảo IELTS Writing. Chấm điểm bài essay này theo band 0-9.
    Bài viết: ${essayText}
    
    Trả lời CHỈ bằng JSON: {"score": 7.5, "feedback": "Phản hồi chi tiết bằng tiếng Việt..."}
  `;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Parse JSON từ response (Gemini trả text, cần parse)
  try {
    return JSON.parse(response.trim());
  } catch (e) {
    throw new Error("Invalid JSON response from Gemini");
  }
};

/**
 * Chấm điểm Speaking: Input transcript → Output score + feedback
 */
const scoreSpeaking = async (transcriptText) => {
  const prompt = `
    Bạn là giám khảo IELTS Speaking. Chấm điểm phần nói này theo band 0-9.
    Bản ghi âm (transcript): ${transcriptText}
    
    Trả lời CHỈ bằng JSON: {"score": 6.5, "feedback": "Phát âm tốt, nhưng fluency cần cải thiện..."}
  `;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  try {
    return JSON.parse(response.trim());
  } catch (e) {
    throw new Error("Invalid JSON response from Gemini");
  }
};

/**
 * General feedback (cho Reading/Listening)
 */
const generateFeedback = async (skill, input, score) => {
  const prompt = `Tạo phản hồi chi tiết cho kỹ năng ${skill} với điểm ${score}: ${input}`;
  const result = await model.generateContent(prompt);
  return { feedback: result.response.text() };
};

module.exports = {
  scoreWriting,
  scoreSpeaking,
  generateFeedback,
};
