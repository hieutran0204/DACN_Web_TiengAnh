const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(process.env.NEO4J_USERNAME || 'neo4j', process.env.NEO4J_PASSWORD || 'password123')
);

async function fixData() {
  const session = driver.session();
  try {
    console.log("🛠 Đang bắt đầu cứu hộ dữ liệu...");
    
    // Tìm các node liên quan đến IELTS hoặc Report mà chưa có Category
    const query = `
      MATCH (n:KnowledgePoint)
      WHERE n.category IS NULL OR n.category = "Khác (Other)"
      SET n.category = "Bài mẫu (Sample Essay)"
      RETURN count(n)
    `;
    
    const result = await session.run(query);
    console.log(`✅ Thành công! Đã chuyển ${result.records[0].get(0)} hạt tri thức về mục [Bài mẫu (Sample Essay)].`);
    
  } catch (err) {
    console.error("❌ Lỗi cứu hộ:", err);
  } finally {
    await session.close();
    await driver.close();
  }
}

fixData();
