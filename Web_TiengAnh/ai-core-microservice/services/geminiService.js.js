// services/geminiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", // ĐÃ CHẠY NGON VỚI BẠN
  temperature: 0.2, // Càng thấp → càng chính xác, ít bịa
  topP: 0.95,
  topK: 40,
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

// ==================== WRITING: BẮT BUỘC LIỆT KÊ TỪ HAY, CẤP ĐỘ TỪ VỰNG ====================
const analyzeWriting = async (essay, question = "", type = "ielts-task2") => {
  const prompt = `
Bạn là chuyên gia IELTS band 9.0 và nhà ngôn ngữ học tiếng Anh.

Phân tích bài viết sau và TRẢ VỀ CHỈ JSON ĐÚNG CẤU TRÚC DƯỚI ĐÂY (không thiếu trường nào, không thêm giải thích):

Topic: ${question}
Essay:
"""${essay}"""

{
  "overall_band": 7.0,
  "band_breakdown": {
    "task_response": 7.0,
    "coherence_cohesion": 7.5,
    "lexical_resource": 7.0,
    "grammatical_range_accuracy": 6.5
  },
  "feedback_vn": "Bài viết có lập luận rõ ràng, từ vựng tốt nhưng còn lặp từ và cần đa dạng cấu trúc hơn.",

  "advanced_vocabulary": [
    {"word": "outweigh", "level": "C1", "meaning_vn": "vượt trội hơn"},
    {"word": "crucial", "level": "B2", "meaning_vn": "quan trọng"}
  ],
  "idioms_phrasalverbs": [
    {"phrase": "take for granted", "meaning_vn": "coi là hiển nhiên"},
    {"phrase": "play a vital role", "meaning_vn": "đóng vai trò quan trọng"}
  ],
  "collocations": [
    "strong argument",
    "widely acknowledged",
    "profound impact"
  ],
  "academic_words": [
    "nevertheless", "moreover", "consequently", "in contrast"
  ],
  "repeated_words": ["people", "think", "good"],
  "filler_words_in_writing": ["very", "really", "just"],

  "word_count": 248,
  "vocab_level_distribution": {
    "A1-A2": 45,
    "B1": 88,
    "B2": 72,
    "C1": 35,
    "C2": 8
  },
  "lexical_density": 58.2,
  "type_token_ratio": 0.42,

  "grammar_errors_found": [
    {"error": "It save time → It saves time", "type": "subject-verb agreement"},
    {"error": "have bad effect → have a bad effect", "type": "article"}
  ],
  "corrected_essay": "In recent years, an increasing number of individuals have turned to the Internet...",

  "strengths": ["Clear position", "Good use of examples", "Logical structure"],
  "weaknesses": ["Word repetition", "Limited range of complex structures"],
  "recommendations_vn": "Hãy thay 'good' bằng: beneficial, advantageous, favourable, conducive...",

  "modelinessary_words_count": 12,
  "model_source": "gemini-2.0-flash",
  "generated_at": "${new Date().toISOString()}"
}
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    const data = extractJSON(text);
    if (data && !data.error) {
      data.generated_at = new Date().toISOString();
    }
    return data;
  } catch (err) {
    return { error: "Gemini error", details: err.message };
  }
};

// ==================== SPEAKING: CŨNG BẮT BUỘC LIỆT KÊ TỪ HAY ====================
const analyzeSpeaking = async (transcript, question = "", part = "Part 2") => {
  const prompt = `
Bạn là giám khảo IELTS Speaking band 9.0.

Phân tích transcript sau và trả về CHỈ JSON:

Part: ${part}
Topic: ${question}
Transcript:
"""${transcript}"""

{
  "overall_band": 7.0,
  "band_breakdown": {
    "fluency_coherence": 7.5,
    "lexical_resource": 7.0,
    "grammatical_range": 7.0,
    "pronunciation": 6.5
  },
  "feedback_vn": "Bạn nói khá trôi chảy, từ vựng tốt nhưng hay dùng 'you know' và phát âm một số từ chưa chuẩn.",

  "advanced_vocabulary_used": [
    {"word": "picturesque", "level": "C1"},
    {"word": "breathtaking", "level": "C1"}
  ],
  "idioms_phrasalverbs": ["chill out", "get away from it all"],
  "collocations": ["stunning view", "peaceful atmosphere"],

  "filler_words": ["um", "you know", "like", "well"],
  "filler_count": 8,
  "repeated_words": ["really", "very", "beautiful"],
  "hesitation_markers": 6,

  "word_count": 168,
  "words_per_minute": 142,
  "vocab_level": "B2-C1",

  "pronunciation_issues": [
    {"word": "beautiful", "your": "beauty-ful", "correct": "BYOO-tə-fəl"},
    {"word": "comfortable", "your": "com-fort-able", "correct": "KUMF-tə-bəl"}
  ],

  "strengths": ["Natural intonation", "Good topic development"],
  "weaknesses": ["Overuse of fillers", "Some word stress errors"],
  "recommendations_vn": "Giảm 'you know', thay bằng: 'personally speaking', 'from my perspective'...",

  "model_source": "gemini-2.0-flash",
  "generated_at": "${new Date().toISOString()}"
}
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    const data = extractJSON(text);
    if (data && !data.error) data.generated_at = new Date().toISOString();
    return data;
  } catch (err) {
    return { error: "Gemini error", details: err.message };
  }
};

module.exports = {
  analyzeWriting,
  analyzeSpeaking,
};
