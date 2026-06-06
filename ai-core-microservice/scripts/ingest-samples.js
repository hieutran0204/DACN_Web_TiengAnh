/**
 * scripts/ingest-samples.js
 * 
 * Script to populate Layer 4 with high-band discourse skeletons.
 */
const vectorStore = require('../services/ai/vector-store.service');

const sampleSkeletons = [
    {
        essay_band: 8.5,
        topic_category: "Technology",
        structure_path: "CLAIM -> EVIDENCE -> EXAMPLE -> CONSEQUENCE",
        content_representation: "[CLAIM] Technology streamlines daily administrative tasks. [EVIDENCE] Automation reduces the need for manual data entry and human error. [EXAMPLE] For instance, banking apps allow instant transactions without visiting a branch. [CONSEQUENCE] This efficiency leads to significant time savings for the general public.",
        feedback_template: "Để đạt Band 8+, bạn nên nối tiếp Luận điểm (Claim) bằng một Lý lẽ (Evidence) giải thích cơ chế, sau đó mới đưa ra Ví dụ (Example) và kết thúc bằng Hệ quả (Consequence)."
    },
    {
        essay_band: 8.0,
        topic_category: "Education",
        structure_path: "CLAIM -> CONTRAST -> REBUTTAL -> CONCLUSION",
        content_representation: "[CLAIM] Some argue that online learning is less effective than traditional classrooms. [CONTRAST] However, digital platforms provide unprecedented access to global resources. [REBUTTAL] In reality, the flexibility of remote study often outweighs the lack of face-to-face interaction. [CONCLUSION] Therefore, e-learning should be viewed as a primary educational tool.",
        feedback_template: "Khi viết về các ý kiến trái chiều, hãy sử dụng cấu trúc Phản biện (Rebuttal): Nêu ý kiến đối lập -> Dùng từ nối tương phản (However/Nevertheless) -> Đưa ra lý lẽ phản bác -> Chốt lại vấn đề."
    },
    {
        essay_band: 8.0,
        topic_category: "Environment",
        structure_path: "PROBLEM -> CAUSE -> SOLUTION -> EXPECTED_OUTCOME",
        content_representation: "[PROBLEM] Urban air quality is deteriorating rapidly. [CAUSE] This is primarily driven by the excessive use of private vehicles. [SOLUTION] Governments should invest heavily in zero-emission public transport. [EXPECTED_OUTCOME] As a result, carbon footprints would decrease and public health would improve.",
        feedback_template: "Với dạng bài Problem/Solution, hãy đảm bảo mạch logic đi từ Vấn đề -> Nguyên nhân trực tiếp -> Giải pháp tương ứng -> Kết quả mong đợi để tạo tính thuyết phục tuyệt đối."
    }
];

async function runIngestion() {
    console.log("🚀 Starting Layer 4 Data Ingestion...");
    
    for (const skeleton of sampleSkeletons) {
        try {
            // 🔥 FIX: Sử dụng Unified Ingest Method mới
            await vectorStore.ingest('skeleton', skeleton);
        } catch (err) {
            console.error(`❌ Failed to ingest skeleton for ${skeleton.topic_category}:`, err.message);
        }
    }

    console.log("\n✨ Ingestion complete. Layer 4 is now enriched with high-band skeletons.");
    process.exit(0);
}

runIngestion();
