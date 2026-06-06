const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const csv = require('csv-parser');
const graphService = require('../services/graph.service');

const CSV_PATH = path.join(__dirname, '../KG_Oxford/ielts_writing_dataset.csv');
const HISTORY_PATH = path.join(__dirname, '../data/layer3_band7_state.json');

// --- HÀM LƯU/TẢI TIẾN ĐỘ ---
function loadState() {
    if (fs.existsSync(HISTORY_PATH)) {
        try {
            return JSON.parse(fs.readFileSync(HISTORY_PATH, "utf-8"));
        } catch (e) {
            return { processedCount: 0 };
        }
    }
    return { processedCount: 0 };
}

function saveState(state) {
    const dir = path.dirname(HISTORY_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(state, null, 2), "utf-8");
}

// --- PIPELINE NẠP TẦNG 3 (NEO4J) ---
async function runLayer3Ingestion() {
    console.log("🚀 BẮT ĐẦU NẠP DỮ LIỆU TẦNG 3 (NEO4J) 🚀");
    
    // Khởi tạo kết nối Neo4j
    await graphService.init();

    const allEssays = [];
    
    // 1. Đọc dữ liệu từ CSV
    await new Promise((resolve, reject) => {
        fs.createReadStream(CSV_PATH)
            .pipe(csv())
            .on('data', (row) => {
                const score = parseFloat(row.Overall);
                if ((score === 7.0 || score === 7.5) && row.Essay && row.Essay.trim().length > 0) {
                    allEssays.push(row);
                }
            })
            .on('end', resolve)
            .on('error', reject);
    });

    // 2. Lấy tham số skip và tiến độ lưu trữ
    const skipArgIndex = process.argv.indexOf('--skip');
    let skip = 0;
    if (skipArgIndex !== -1 && process.argv.length > skipArgIndex + 1) {
        skip = parseInt(process.argv[skipArgIndex + 1], 10);
    }

    const state = loadState();
    if (state.processedCount > skip) {
        skip = state.processedCount;
    }

    const essaysToProcess = allEssays.slice(skip);
    console.log(`\n🔍 Tìm thấy ${allEssays.length} bài Essay (Band 7.0 - 7.5).`);
    console.log(`⏭️  Đã bỏ qua ${skip} bài. Sẽ xử lý: ${essaysToProcess.length} bài tiếp theo...\n`);

    // 3. Vòng lặp nạp từng bài qua LLM vào Neo4j
    for (let i = 0; i < essaysToProcess.length; i++) {
        const essayRow = essaysToProcess[i];
        const currentGlobalIndex = skip + i + 1;
        
        console.log(`⏳ Đang phân tích bài ${currentGlobalIndex} (Thứ tự ${i + 1}/${essaysToProcess.length} trong đợt này)...`);
        
        try {
            // Tạo một essayId giả định dựa trên Question và Index để phân biệt
            const essayId = `dataset_essay_${currentGlobalIndex}`;
            const studentId = `student_dataset_band_${essayRow.Overall}`;

            // Gọi thẳng graph.service.js (Đã cấu hình sẵn Gemini 2.5 Flash bên trong)
            // graphService tự động extract Triplets và dùng APOC lưu vào Neo4j
            const result = await graphService.analyzeEssay(essayRow.Essay, studentId, essayId);
            
            console.log(`   ✅ Nạp thành công! Rút trích được ${result.tripletsCount} Triplet Nodes.`);
            
            // Cập nhật tiến độ
            state.processedCount = currentGlobalIndex;
            saveState(state);

        } catch (error) {
            console.error(`   ❌ Lỗi khi nạp bài ${currentGlobalIndex}:`, error.message);
            // Có thể chọn break hoặc continue ở đây. Mình để continue để nó tự lướt qua bài lỗi.
        }

        // 4. Delay chống Rate Limit của Gemini API (2-3 giây)
        console.log(`   ⏳ Chờ 3 giây để tránh Rate Limit...`);
        await new Promise(r => setTimeout(r, 3000));
    }

    console.log("\n🎉 HOÀN TẤT QUÁ TRÌNH NẠP DỮ LIỆU VÀO LAYER 3 (NEO4J)!");
    process.exit(0);
}

runLayer3Ingestion();
