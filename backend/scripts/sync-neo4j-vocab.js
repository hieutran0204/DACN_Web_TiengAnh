const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const WordCategory = require('../models/vocabulary/WordCategory.model');

// Connect to Neo4j
const neo4jUri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const neo4jUser = process.env.NEO4J_USER || 'neo4j';
const neo4jPassword = process.env.NEO4J_PASSWORD || 'password123';

const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));

// Map CEFR levels to our MongoDB levels
const mapLevel = (neo4jLevel) => {
    if (!neo4jLevel) return 'Intermediate';
    const lvl = neo4jLevel.toUpperCase();
    if (lvl.includes('A1') || lvl.includes('A2')) return 'Beginner';
    if (lvl.includes('B1') || lvl.includes('B2')) return 'Intermediate';
    if (lvl.includes('C1') || lvl.includes('C2')) return 'Advanced';
    return 'Intermediate'; // Default fallback
};

async function syncVocab() {
    let session;
    try {
        // 1. Connect MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/DACN_Web_TiengAnh');
        console.log('✅ Đã kết nối MongoDB');

        // 2. Fetch data from Neo4j
        console.log('🔍 Đang lấy dữ liệu từ Neo4j...');
        session = driver.session();
        
        // Query 1: Words with specific topics
        const topicResult = await session.run(`
            MATCH (t:Topic)<-[:BELONGS_TO_TOPIC]-(w:Word)
            RETURN t.name AS topic, collect({word: w.name, level: w.level}) AS words
        `);

        // Query 2: Words WITHOUT topics but with a valid Oxford level
        const generalResult = await session.run(`
            MATCH (w:Word)
            WHERE NOT (w)-[:BELONGS_TO_TOPIC]->(:Topic) AND w.level IN ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
            RETURN w.level AS level, collect(w.name) AS words
        `);

        console.log(`📦 Lấy được ${topicResult.records.length} topics cụ thể.`);
        console.log(`📦 Lấy được ${generalResult.records.length} nhóm level chung từ Oxford.`);

        await WordCategory.deleteMany({});
        console.log('🗑️ Đã xóa các WordCategory cũ để nạp mới.');

        let totalCategories = 0;
        let totalWords = 0;

        // Xử lý nhóm Topic cụ thể
        for (const record of topicResult.records) {
            const topicName = record.get('topic');
            const wordsList = record.get('words');

            const groupedWords = { Beginner: new Set(), Intermediate: new Set(), Advanced: new Set() };
            for (const item of wordsList) {
                groupedWords[mapLevel(item.level)].add(item.word);
            }

            for (const [level, wordsSet] of Object.entries(groupedWords)) {
                if (wordsSet.size === 0) continue;
                const wordsArr = Array.from(wordsSet);
                const categoryName = `${topicName} (${level})`;

                await new WordCategory({
                    name: categoryName,
                    level: level,
                    description: `Từ vựng chuyên đề ${topicName} cấp độ ${level}.`,
                    wordCount: wordsArr.length,
                    words: wordsArr,
                    image: "https://cdn-icons-png.flaticon.com/512/3426/3426653.png"
                }).save();
                totalCategories++;
                totalWords += wordsArr.length;
            }
        }

        // Xử lý nhóm Oxford General
        const oxfordGroups = { Beginner: new Set(), Intermediate: new Set(), Advanced: new Set() };
        for (const record of generalResult.records) {
            const rawLevel = record.get('level');
            const wordsArr = record.get('words');
            const mapped = mapLevel(rawLevel);
            wordsArr.forEach(w => oxfordGroups[mapped].add(w));
        }

        for (const [level, wordsSet] of Object.entries(oxfordGroups)) {
            if (wordsSet.size === 0) continue;
            const wordsArr = Array.from(wordsSet);
            // Có thể chia nhỏ nếu một mảng quá lớn, nhưng với 1000 từ thì MongoDB vẫn lưu tốt trong 1 document.
            // Để UI dễ nhìn, chia nhỏ ra mỗi mốc 500 từ.
            const CHUNK_SIZE = 500;
            for (let i = 0; i < wordsArr.length; i += CHUNK_SIZE) {
                const chunk = wordsArr.slice(i, i + CHUNK_SIZE);
                const part = Math.floor(i / CHUNK_SIZE) + 1;
                const categoryName = `Oxford General ${level} - Phần ${part}`;

                await new WordCategory({
                    name: categoryName,
                    level: level,
                    description: `Bộ từ vựng chuẩn Oxford cấp độ ${level} (Tổng hợp chung).`,
                    wordCount: chunk.length,
                    words: chunk,
                    image: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png"
                }).save();
                totalCategories++;
                totalWords += chunk.length;
            }
        }

        console.log(`🎉 Hoàn tất! Đã nạp thành công ${totalCategories} chủ đề với tổng cộng ${totalWords} từ vựng vào MongoDB.`);

    } catch (err) {
        console.error('❌ Lỗi:', err);
    } finally {
        if (session) await session.close();
        await driver.close();
        await mongoose.disconnect();
    }
}

syncVocab();
