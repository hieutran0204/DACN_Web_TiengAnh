const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const WordCategory = require('../models/vocabulary/WordCategory.model');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Cấu hình Gemini AI
const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ Lỗi: Không tìm thấy API Key của Google Gemini trong .env");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function runAIVocabOrganizer() {
  try {
    // 1. Kết nối Database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/DACN_Web_TiengAnh');
    console.log('✅ Đã kết nối MongoDB');

    // 2. Lấy toàn bộ từ vựng hiện có
    const categories = await WordCategory.find({}, 'words');
    let allWords = new Set();
    categories.forEach(c => {
        if (c.words && Array.isArray(c.words)) {
            c.words.forEach(w => allWords.add(w.toLowerCase().trim()));
        }
    });
    
    const wordsArray = Array.from(allWords).filter(w => w.length > 1);
    console.log(`📦 Đã thu thập được tổng cộng ${wordsArray.length} từ vựng unique từ DB.`);

    if (wordsArray.length === 0) {
        console.log("⚠️ Không có từ vựng nào để phân loại.");
        return;
    }

    // 3. Gọi AI phân loại (chúng ta sẽ cắt thành chunk nếu quá dài, nhưng với 500 từ thì nhét chung 1 prompt vẫn ổn)
    console.log("🤖 Đang nhờ Gemini AI phân loại và tạo chủ đề IELTS...");
    
    const prompt = `
You are an expert IELTS vocabulary curriculum designer.
I have a raw list of ${wordsArray.length} English words.
Your task is to analyze these words, categorize them into specific, meaningful IELTS topics (e.g., Environment, Economy, Technology, Health, Education, Society, etc.), and estimate their difficulty level (Beginner, Intermediate, Advanced).

Ignore overly simple or generic words (like hi, bye, yes, no). Focus on words that fit into academic or conversational themes.
Create at most 8 high-quality categories. Each word can only belong to ONE category.

RAW WORD LIST:
${wordsArray.join(', ')}

Return ONLY a valid JSON array in this exact format:
[
  {
    "name": "IELTS Theme: [Topic Name]",
    "level": "Intermediate", 
    "description": "Short description of this vocabulary theme",
    "words": ["word1", "word2", ...]
  }
]
    `;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
        }
    });

    const responseText = result.response.text();
    const generatedCategories = JSON.parse(responseText);

    console.log(`✅ Gemini đã phân loại thành ${generatedCategories.length} chủ đề mới!`);

    // 4. Lưu vào Database
    for (const catData of generatedCategories) {
        if (catData.words.length === 0) continue;
        
        const newCategory = new WordCategory({
            name: catData.name,
            level: catData.level,
            description: catData.description + " (AI Generated)",
            wordCount: catData.words.length,
            words: catData.words,
            image: "https://cdn-icons-png.flaticon.com/512/2941/2941572.png" // Icon AI
        });
        await newCategory.save();
        console.log(`   👉 Đã lưu chủ đề: "${catData.name}" với ${catData.words.length} từ.`);
    }

    console.log("🎉 Hoàn tất quá trình nạp và phân từ bằng AI!");

  } catch (err) {
    console.error("❌ Lỗi trong quá trình chạy AI:", err);
  } finally {
    mongoose.disconnect();
  }
}

runAIVocabOrganizer();
