// // services/geminiService.js
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const genAI = new GoogleGenerativeAI(
//   process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
// );

// const model = genAI.getGenerativeModel({
//   model: "gemini-1.5-pro",
//   temperature: 0.3,
//   topP: 0.95,
//   topK: 40,
//   systemInstruction: `
// You are an official IELTS & TOEIC examiner with 20+ years of experience.
// You evaluate English writing and speaking strictly according to official band descriptors.
// You provide feedback in PERFECT Vietnamese for Vietnamese learners.
// You NEVER add extra text, never use markdown.
// You ALWAYS return ONLY valid JSON with exact structure requested.
// `.trim(),
// });

// const extractJSON = (text) => {
//   try {
//     const cleaned = text.replace(/```json|```/g, "").trim();
//     const start = cleaned.lastIndexOf("{");
//     const end = cleaned.lastIndexOf("}") + 1;
//     if (start === -1 || end === 0) throw new Error("No JSON");
//     return JSON.parse(cleaned.substring(start, end));
//   } catch (e) {
//     console.error("Parse JSON thất bại:", text.substring(0, 500));
//     return { error: "AI trả về không phải JSON", raw: text.substring(0, 800) };
//   }
// };

// const scoreWriting = async (essayText, question = "", type = "ielts-task2") => {
//   const prompt = `
// Task: ${type}
// Question: ${question || "No question provided"}
// Essay:
// """${essayText}"""
//
// Return ONLY valid JSON (no extra text):
// {
//   "overall_band": 6.5,
//   "band_breakdown": {
//     "task_response": 6.0,
//     "coherence_cohesion": 7.0,
//     "lexical_resource": 6.0,
//     "grammatical_range_accuracy": 7.0
//   },
//   "advanced_vocabulary": ["word1", "word2"],
//   "idioms_phrasalverbs": ["idiom1"],
//   "collocations": ["collocation1"],
//   "grammar_errors_found": ["error1", "error2"],
//   "strengths": ["Clear position", "Good supporting ideas"],
//   "weaknesses": ["Some repetition", "Minor grammar issues"],
//   "recommendations_vn": "Nên sử dụng câu phức nhiều hơn...",
//   "corrected_essay": "Phiên bản bài viết đã sửa lỗi..."
// }
//   `.trim();
//
//   const result = await model.generateContent(prompt);
//   const response = await result.response;
//   return extractJSON(response.text());
// };

// const scoreSpeaking = async (transcript, question = "", part = "Part 2") => {
//   const prompt = `
// IELTS Speaking ${part}
// Question: ${question || "Describe something..."}
// Transcript:
// """${transcript}"""
//
// Return ONLY valid JSON:
// {
//   "ielts_band": 7.5,
//   "toeic_score": 27,
//   "overall_comment_vn": "Nói rất trôi chảy, từ vựng phong phú, phát âm rõ. Chỉ cần giảm lặp từ và dùng idiom tự nhiên hơn.",
//   "feedback": {
//     "fluency_coherence": "Speaks at length with natural hesitation",
//     "lexical_resource": "Wide range with some less common items",
//     "grammatical_range": "Good control of complex structures",
//     "pronunciation": "Easily understood with clear intonation"
//   },
//   "corrected_transcript": "Band 8.0 version of your answer...",
//   "issues": ["repeated 'I think'", "one article error"]
// }
//   `.trim();
//
//   const result = await model.generateContent(prompt);
//   const response = await result.response;
//   return extractJSON(response.text());
// };

// const generateFeedback = async (skill, input, score) => {
//   const prompt = `Tạo phản hồi chi tiết bằng TIẾNG VIỆT cho học sinh đạt ${score} ở kỹ năng ${skill}.\nDữ liệu: ${input}\nChỉ trả về JSON: {"feedback_vn": "phản hồi động viên, chi tiết"}`;
//   const result = await model.generateContent(prompt);
//   const response = await result.response;
//   return extractJSON(response.text());
// };

// module.exports = {
//   scoreWriting,
//   scoreSpeaking,
//   generateFeedback,
// };

require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Đúng đường dẫn vì file nằm ngoài cùng
const authMiddleware = require("./middleware/auth");
const aiRoutes = require("./routes/ai");
const graphRoutes = require("./routes/graph");
const graphService = require("./services/graph.service");
const ruleBasedService = require("./services/nlp/rule-based.service");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "http://localhost:5173", 
      process.env.APP_ORIGIN
    ].filter(Boolean),
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));

// Routes
// Public AI Chat Route (No API Key required for Frontend access)
app.use("/api/chat", require("./routes/chat"));

// Protected Routes
app.use("/api/ai", authMiddleware.verifyAPIKey, aiRoutes);

// GraphRAG Routes
app.use("/api/graph", graphRoutes);

// Health check
app.get("/health", (req, res) =>
  res.json({
    status: "OK",
    service: "AI Core Microservice",
    time: new Date().toISOString(),
  })
);

app.get("/", (req, res) => {
  res.json({ message: "AI Core Microservice đang chạy cực mạnh!" });
});

const server = app.listen(PORT, async () => {
  console.log(`AI Core chạy thành công tại http://localhost:${PORT}`);
  
  // Initialize Graph service & Sync Vocabulary
  try {
    await graphService.init();
    
    // Đồng bộ từ vựng từ Graph sang RuleBasedService
    // Đồng bộ từ vựng từ Neo4j
    const wordNames = await graphService.getAllWordNames();
    ruleBasedService.setAcademicWords(wordNames);

    // Đồng bộ kiến thức từ folder /md (Grammar, Topic Vocabulary)
    const mdPath = path.join(__dirname, 'md');
    await ruleBasedService.bootstrapFromMarkdown(mdPath);

    console.log("🚀 Tất cả từ vựng và kiến thức KG đã sẵn sàng.");
  } catch (err) {
    console.error("❌ Lỗi khi khởi động AI Core:", err);
  }
});

// Set timeout to 10 minutes for long AI analysis
server.timeout = 600000;
// Endpoint liệt kê model có sẵn (gọi REST API vì SDK JS không hỗ trợ listModels)
app.get("/list-models", async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    // Lọc model hỗ trợ generateContent
    const supportedModels = data.models
      .filter(
        (m) =>
          m.supportedGenerationMethods &&
          m.supportedGenerationMethods.includes("generateContent")
      )
      .map((m) => ({
        name: m.name.split("/")[1],
        displayName: m.displayName || m.name,
      })); // Lấy tên model (e.g., gemini-2.0-flash)
    res.json({ available: supportedModels, total: supportedModels.length });
  } catch (err) {
    console.error("Lỗi liệt kê model:", err.message);
    res.status(500).json({ error: err.message });
  }
});