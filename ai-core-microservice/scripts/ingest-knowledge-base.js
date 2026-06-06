/**
 * scripts/ingest-knowledge-base.js
 * 
 * Nạp các file markdown (.md) chứa quy tắc ngữ pháp, tiêu chí chấm điểm (band descriptors),
 * và bài tập thực hành vào Vector Store (knowledge chunk).
 * 
 * Sử dụng để bổ sung "Sách giáo khoa" cho hệ thống AI Tutor.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const vectorStore = require('../services/ai/vector-store.service');

const MD_BASE_DIR = path.join(__dirname, '../md');

/**
 * Đọc toàn bộ các file .md trong thư mục và thư mục con
 */
function getAllMarkdownFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllMarkdownFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.md')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

/**
 * Tách nội dung file markdown thành các chunk (theo tiêu đề H2 hoặc đoạn văn)
 */
function chunkMarkdown(content, sourcePath) {
  const lines = content.split('\n');
  const chunks = [];
  let currentChunk = '';
  let currentTopic = path.basename(sourcePath, '.md').replace(/[_-]/g, ' ');

  for (let line of lines) {
    if (line.startsWith('## ')) {
      // Lưu chunk cũ nếu có
      if (currentChunk.trim().length > 50) {
        chunks.push({ text: currentChunk.trim(), topic: currentTopic });
      }
      // Bắt đầu chunk mới
      currentTopic = line.replace('## ', '').trim();
      currentChunk = line + '\n';
    } else if (line.startsWith('# ')) {
      // Bỏ qua H1, thường là tựa đề file
      continue; 
    } else {
      currentChunk += line + '\n';
    }
  }

  // Push chunk cuối cùng
  if (currentChunk.trim().length > 50) {
    chunks.push({ text: currentChunk.trim(), topic: currentTopic });
  }

  // Nếu file không có heading H2 nào, chia theo đoạn văn (mỗi 3-4 đoạn = 1 chunk)
  if (chunks.length === 0 && content.trim().length > 0) {
     const paragraphs = content.split('\n\n');
     let tempChunk = '';
     for(let i=0; i < paragraphs.length; i++){
        tempChunk += paragraphs[i] + '\n\n';
        if ((i + 1) % 3 === 0 || i === paragraphs.length - 1) {
            chunks.push({ text: tempChunk.trim(), topic: currentTopic });
            tempChunk = '';
        }
     }
  }

  return chunks;
}

async function run() {
  console.log("📚 Bắt đầu nạp Knowledge Base (Markdown) vào Vector Store (Layer 4)...");

  if (!fs.existsSync(MD_BASE_DIR)) {
    console.error(`❌ Thư mục không tồn tại: ${MD_BASE_DIR}`);
    console.log("💡 Gợi ý: Hãy tạo thư mục 'md/exercises/grammar', 'md/band_descriptors' và viết một vài file .md vào đó.");
    process.exit(1);
  }

  const mdFiles = getAllMarkdownFiles(MD_BASE_DIR);
  
  if (mdFiles.length === 0) {
    console.log(`⚠️ Không tìm thấy file .md nào trong ${MD_BASE_DIR}`);
    process.exit(0);
  }

  console.log(`🔍 Tìm thấy ${mdFiles.length} file Markdown. Đang tiến hành băm (chunking) và nhúng (embedding)...`);

  let totalChunks = 0;

  for (const filePath of mdFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const category = path.basename(path.dirname(filePath)); // Tên thư mục chứa file
    
    const chunks = chunkMarkdown(content, filePath);
    
    console.log(`   📄 File: ${path.basename(filePath)} -> ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const payload = {
        topic: chunks[i].topic,
        text: chunks[i].text,
        content_representation: `[${category.toUpperCase()}] ${chunks[i].topic}`,
        timestamp: new Date().toISOString(),
        source: path.basename(filePath)
      };

      // Gọi vectorStore.ingest với loại là 'knowledge'
      await vectorStore.ingest('knowledge', payload);
      totalChunks++;
    }
  }

  console.log(`\n🎉 Hoàn tất nạp ${totalChunks} knowledge chunks vào Vector Store!`);
  process.exit(0);
}

run().catch(err => {
  console.error("💥 Lỗi khi nạp knowledge base:", err);
  process.exit(1);
});
