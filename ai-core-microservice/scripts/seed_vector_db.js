const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const csv = require('csv-parser');
const nlp = require('compromise');
const discourseClassifier = require('../services/ai/discourse-classifier.service');
const vectorStore = require('../services/ai/vector-store.service');

const CSV_PATH = path.join(__dirname, '../KG_Oxford/ielts_writing_dataset.csv');
const HISTORY_PATH = path.join(__dirname, '../data/vector_ingest_state.json');

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

// Ánh xạ role sang Skeleton Format
const roleToSkeletonNode = (role) => {
    if (!role) return '[UNKNOWN]';
    const map = {
        'topic_sentence': '[CLAIM]',
        'supporting_detail': '[EVIDENCE]',
        'example': '[EXAMPLE]',
        'transitional': '[TRANSITION]',
        'conclusion': '[CONCLUSION]',
        'unknown': '[UNKNOWN]'
    };
    return map[role.toLowerCase()] || '[UNKNOWN]';
};

async function processEssay(essayText, question) {
    // 1. Tách câu (Sử dụng thư viện Compromise)
    const doc = nlp(essayText);
    const sentences = doc.sentences().out('array');
    
    if (sentences.length === 0) return null;

    let skeletonArr = [];

    // 2. Chạy qua Layer 1 & 2 (Discourse Classifier) để gán nhãn
    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        // Truyền câu vào Classifier để nhận nhãn (Data Bootstrapping cũng sẽ ngầm được kích hoạt ở đây)
        const result = await discourseClassifier.classify(sentence, [], i);
        skeletonArr.push(roleToSkeletonNode(result.role));
    }

    // 3. Nối thành chuỗi Skeleton Path: [CLAIM] -> [EVIDENCE] -> [EXAMPLE]
    const skeletonPath = skeletonArr.join(' -> ');

    // 4. Lưu vào Layer 4 (Vector Store - ChromaDB/MongoDB)
    const payload = {
        topic: question,
        text: essayText,
        content_representation: skeletonPath,
        timestamp: new Date().toISOString()
    };

    await vectorStore.ingest('skeleton', payload);
    console.log(`✅ Đã nạp thành công bộ xương: ${skeletonPath}`);
}

async function run() {
    console.log("🚀 Bắt đầu quét và nạp dữ liệu IELTS >= 8.0 vào Vector DB (Layer 4)...");
    
    const results = [];
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (data) => {
          // Lọc dữ liệu: Lấy cả Task 1 và Task 2 miễn là điểm Overall >= 8.0
          if (parseFloat(data.Overall) >= 8.0) {
              results.push(data);
          }
      })
      .on('end', async () => {
          // Lấy tham số limit từ command line (nếu có), ví dụ: node seed_vector_db.js --limit 2
          const limitArgIndex = process.argv.indexOf('--limit');
          let limit = results.length;
          if (limitArgIndex !== -1 && process.argv.length > limitArgIndex + 1) {
              limit = parseInt(process.argv[limitArgIndex + 1], 10);
          }

          // Lấy tham số skip từ command line (nếu có), ví dụ: node seed_vector_db.js --skip 31
          const skipArgIndex = process.argv.indexOf('--skip');
          let skip = 0;
          if (skipArgIndex !== -1 && process.argv.length > skipArgIndex + 1) {
              skip = parseInt(process.argv[skipArgIndex + 1], 10);
          }

          // Lấy tiến độ từ file state
          const state = loadState();
          if (state.processedCount > skip) {
              skip = state.processedCount;
          }

          const essaysToProcess = results.slice(skip, skip + Math.min(limit, results.length - skip));
          console.log(`🔍 Tìm thấy ${results.length} bài Essay đạt chuẩn (Band >= 8.0). Bỏ qua ${skip} bài đã nạp. Sẽ xử lý: ${essaysToProcess.length} bài...`);
          
          // Batch Processing: Chạy vòng lặp xử lý từng bài
          for (let i = 0; i < essaysToProcess.length; i++) {
              console.log(`\n⏳ Đang xử lý bài ${skip + i + 1} (thứ tự ${i + 1}/${essaysToProcess.length} trong đợt này)...`);
              await processEssay(essaysToProcess[i].Essay, essaysToProcess[i].Question);
              
              // Cập nhật tiến độ sau mỗi bài thành công
              state.processedCount = skip + i + 1;
              saveState(state);
          }
          
          console.log("🎉 Hoàn tất quá trình nạp dữ liệu vào Layer 4 Vector Store!");
          process.exit(0);
      });
}

run();
