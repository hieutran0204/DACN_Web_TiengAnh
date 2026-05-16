
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY);
  try {
    console.log("🔍 Đang lấy danh sách models...");
    // Gọi trực tiếp fetch để lấy danh sách cho chuẩn
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    const embeddingModels = data.models.filter(m => m.supportedGenerationMethods.includes("embedContent"));
    console.log("✅ Các models hỗ trợ Embedding:");
    embeddingModels.forEach(m => console.log(`- ${m.name}`));
  } catch (err) {
    console.error("❌ Lỗi:", err.message);
  }
}

listModels();
