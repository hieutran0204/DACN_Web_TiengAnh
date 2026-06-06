require("dotenv").config();
const fs = require("fs");
const path = require("path");
const graphService = require("../services/graph.service");

const HISTORY_PATH = path.join(__dirname, "../data/ingest_history.json");

function loadHistory() {
  if (fs.existsSync(HISTORY_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(HISTORY_PATH, "utf-8"));
    } catch (e) {
      return {};
    }
  }
  return {};
}

function saveHistory(history) {
  const dir = path.dirname(HISTORY_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), "utf-8");
}

let historyCache = loadHistory();

async function ingestFolder(folderPath) {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);
    
    if (entry.isDirectory()) {
      await ingestFolder(fullPath);
    } else if (entry.name.endsWith(".md") && !entry.name.startsWith("README")) {
      const stat = fs.statSync(fullPath);
      const mtime = stat.mtimeMs;
      const relativePath = path.relative(path.join(__dirname, ".."), fullPath);

      // 🔥 NẠP GIA TĂNG (INCREMENTAL INGEST): Bỏ qua nếu file đã nạp thành công và không thay đổi
      if (
        historyCache[relativePath] &&
        historyCache[relativePath].status === "success" &&
        historyCache[relativePath].mtime === mtime
      ) {
        console.log(`⏭️  [Đã nạp] Bỏ qua file không thay đổi: ${entry.name}`);
        continue;
      }

      console.log(`\n📄 Đang xử lý file: ${entry.name}...`);
      const content = fs.readFileSync(fullPath, "utf-8");
      const category = path.basename(folderPath);
      
      try {
        const result = await graphService.ingestMasterKnowledge(content, category);
        console.log(`✅ Thành công: ${entry.name}`);
        console.log(`   - Chunks: ${result.chunksAdded}`);
        console.log(`   - Triplets: ${result.tripletsAdded}`);

        // Cập nhật lịch sử nạp thành công
        historyCache[relativePath] = {
          mtime: mtime,
          status: "success",
          lastIngested: new Date().toISOString(),
          chunksAdded: result.chunksAdded,
          tripletsAdded: result.tripletsAdded
        };
        saveHistory(historyCache);
      } catch (err) {
        console.error(`❌ Lỗi khi nạp file ${entry.name}:`, err.message);
        
        // Cập nhật lịch sử nạp thất bại để lần sau thử lại
        historyCache[relativePath] = {
          mtime: mtime,
          status: "failed",
          lastIngested: new Date().toISOString(),
          error: err.message
        };
        saveHistory(historyCache);
      }
    }
  }
}

async function main() {
  console.log("🚀 Bắt đầu quá trình nạp kiến thức từ Markdown...");
  
  try {
    await graphService.init();
    
    // Thư mục cần nạp kiến thức
    const targetDirs = [
      { name: "band_descriptors", path: path.join(__dirname, "../md/band_descriptors") },
      { name: "ielts", path: path.join(__dirname, "../md/ielts") },
      { name: "grammar", path: path.join(__dirname, "../md/grammar") },
      { name: "topic_vocabulary", path: path.join(__dirname, "../md/topic_vocabulary") },
      { name: "error_patterns", path: path.join(__dirname, "../md/error_patterns") },
      { name: "idea_writing", path: path.join(__dirname, "../md/idea_writing") },
      { name: "sample_essays", path: path.join(__dirname, "../md/sample_essays") },
      { name: "scoring_templates", path: path.join(__dirname, "../md/scoring_templates") },
      { name: "task_type", path: path.join(__dirname, "../md/task_type") }
    ];

    for (const dir of targetDirs) {
      if (fs.existsSync(dir.path)) {
        console.log(`\n📂 Đang nạp dữ liệu từ: ${dir.path} (${dir.name})`);
        await ingestFolder(dir.path);
      } else {
        console.log(`⚠️ Thư mục không tồn tại: ${dir.path}`);
      }
    }
    
    console.log("\n✨ Hoàn tất quá trình nạp dữ liệu!");
    process.exit(0);
  } catch (err) {
    console.error("💥 Lỗi hệ thống:", err.message);
    process.exit(1);
  }
}

main();
