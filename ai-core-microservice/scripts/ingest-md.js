require("dotenv").config();
const fs = require("fs");
const path = require("path");
const graphService = require("../services/graph.service");

async function ingestFolder(folderPath) {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);
    
    if (entry.isDirectory()) {
      await ingestFolder(fullPath);
    } else if (entry.name.endsWith(".md") && !entry.name.startsWith("README")) {
      console.log(`\n📄 Đang xử lý file: ${entry.name}...`);
      
      const content = fs.readFileSync(fullPath, "utf-8");
      // Lấy tên thư mục cha làm category
      const category = path.basename(folderPath);
      
      try {
        const result = await graphService.ingestMasterKnowledge(content, category);
        console.log(`✅ Thành công: ${entry.name}`);
        console.log(`   - Chunks: ${result.chunksAdded}`);
        console.log(`   - Triplets: ${result.tripletsAdded}`);
      } catch (err) {
        console.error(`❌ Lỗi khi nạp file ${entry.name}:`, err.message);
      }
    }
  }
}

async function main() {
  console.log("🚀 Bắt đầu quá trình nạp kiến thức từ Markdown...");
  
  try {
    await graphService.init();
    const baseDir = path.join(__dirname, "../md/band_descriptors");
    
    if (!fs.existsSync(baseDir)) {
      throw new Error(`Thư mục không tồn tại: ${baseDir}`);
    }

    await ingestFolder(baseDir);
    
    console.log("\n✨ Hoàn tất quá trình nạp dữ liệu!");
    process.exit(0);
  } catch (err) {
    console.error("💥 Lỗi hệ thống:", err.message);
    process.exit(1);
  }
}

main();
