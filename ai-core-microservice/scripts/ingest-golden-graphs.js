require('dotenv').config();
const fs = require('fs');
const path = require('path');
const vectorStore = require('../services/ai/vector-store.service');

const GOLDEN_JSON_PATH = path.join(__dirname, '../data/aae_golden_graph.json');

async function main() {
    console.log("🚀 Bắt đầu nạp Golden Graph (AAE2) vào Vector Store (Skeletons)...");
    
    if (!fs.existsSync(GOLDEN_JSON_PATH)) {
        console.error("❌ LỖI: Không tìm thấy file aae_golden_graph.json.");
        console.log("👉 Vui lòng chạy 'python fetch_aae2_golden.py' trước để lấy dữ liệu!");
        process.exit(1);
    }

    const rawData = JSON.parse(fs.readFileSync(GOLDEN_JSON_PATH, 'utf-8'));
    console.log(`✅ Đã đọc thành công ${rawData.length} essays từ file JSON.`);

    // Lọc lấy 50 đồ thị lập luận tiêu biểu nhất (để tránh Embeddings bị nghẽn RAM)
    const samples = rawData.slice(0, 50); 
    let successCount = 0;

    for (let i = 0; i < samples.length; i++) {
        const essay = samples[i];
        if (!essay.triplets || essay.triplets.length === 0) continue;

        let structurePathList = [];
        let contentRepresentation = "";
        
        // Tái tạo lại chuỗi lập luận từ Triplets để Vector Store có thể nhúng (Embedding)
        essay.triplets.forEach(t => {
            const subj = t.subject;
            const obj = t.object;
            const rel = t.relationship;
            
            // Xây dựng mạch liên kết (VD: [EVIDENCE] -> SUPPORTS -> [CLAIM])
            structurePathList.push(`[${subj.label.toUpperCase()}] ${rel} [${obj.label.toUpperCase()}]`);
            contentRepresentation += `[${subj.label.toUpperCase()}] ${subj.name}. `;
        });

        const structurePathStr = [...new Set(structurePathList)].join(" | ");

        // Cấu trúc Data chuẩn khớp với yêu cầu của writing.service.js (Layer 4)
        const skeletonData = {
            essay_band: "8.5", // Chuẩn vàng AAE2
            topic_category: "Golden Argumentation (AAE2)",
            structure_path: structurePathStr,
            content_representation: contentRepresentation.trim(),
            feedback_template: "Hệ thống đối chiếu Neo4j Graph nhận thấy mạch lập luận của bạn có cấu trúc tương đồng với Chuẩn Vàng (AAE2 Golden Standard). Bạn đã sắp xếp rất tốt khi đưa các [EVIDENCE] hỗ trợ trực tiếp cho [CLAIM] một cách mạch lạc mà không bị nhảy cóc ý tưởng. Hãy phát huy cấu trúc lập luận vững chắc này!"
        };

        try {
            await vectorStore.ingest('skeleton', skeletonData);
            successCount++;
            console.log(`- Nạp thành công mẫu skeleton ${successCount}/${samples.length}`);
        } catch (err) {
            console.error(`- Lỗi nạp skeleton:`, err.message);
        }
    }

    console.log(`\n🎉 HOÀN TẤT! Đã bơm ${successCount} Đồ thị Chuẩn Vàng vào Hệ thống CC Layer 4.`);
    process.exit(0);
}

main();
