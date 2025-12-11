const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  temperature: 0.2,
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

const analyzeSpeaking = async (transcript, question = "", part = "Part 2") => {
  const prompt = `
Bạn là giám khảo IELTS Speaking band 9.0.

Phân tích transcript sau và trả về CHỈ JSON theo mẫu:

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
  "feedback_vn": "Bạn nói khá trôi chảy, từ vựng tốt nhưng hay dùng 'you know'.",

  "advanced_vocabulary_used": [
    {"word": "picturesque", "level": "C1"},
    {"word": "breathtaking", "level": "C1"}
  ],
  "idioms_phrasalverbs": ["chill out", "get away from it all"],
  "collocations": ["stunning view", "peaceful atmosphere"],

  "filler_words": ["um", "you know", "like"],
  "filler_count": 8,
  "repeated_words": ["really", "very", "beautiful"],
  
  "pronunciation_issues": [
    {"word": "beautiful", "your": "beauty-ful", "correct": "BYOO-tə-fəl"}
  ],

  "strengths": ["Natural intonation", "Good topic development"],
  "weaknesses": ["Overuse of fillers", "Some word stress errors"],
  "recommendations_vn": "Giảm 'you know', thay bằng: 'personally speaking'...",

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

module.exports = { analyzeSpeaking };
