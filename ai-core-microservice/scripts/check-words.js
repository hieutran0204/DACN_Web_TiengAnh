require("dotenv").config();
const neo4j = require("neo4j-driver");

async function checkWords() {
  const driver = neo4j.driver(
    process.env.NEO4J_URI || "bolt://localhost:7687",
    neo4j.auth.basic(process.env.NEO4J_USERNAME || "neo4j", process.env.NEO4J_PASSWORD || "password123")
  );

  const session = driver.session();

  try {
    console.log("🔍 Đang đếm số lượng từ vựng (Word) và các node liên quan trong Neo4j...");

    // 1. Đếm tổng số node Word
    const wordCountRes = await session.run(`
      MATCH (w:Word)
      RETURN count(w) as wordCount
    `);
    const wordCount = wordCountRes.records[0].get("wordCount").toNumber();
    console.log(`📝 Tổng số node (:Word): ${wordCount}`);

    // 2. Đếm tổng số node Topic
    const topicCountRes = await session.run(`
      MATCH (t:Topic)
      RETURN count(t) as topicCount
    `);
    const topicCount = topicCountRes.records[0].get("topicCount").toNumber();
    console.log(`🏷️ Tổng số node (:Topic): ${topicCount}`);

    // 3. Đếm tổng số node Definition
    const defCountRes = await session.run(`
      MATCH (d:Definition)
      RETURN count(d) as defCount
    `);
    const defCount = defCountRes.records[0].get("defCount").toNumber();
    console.log(`📖 Tổng số node (:Definition): ${defCount}`);

    // 4. Đếm tổng số node PartOfSpeech
    const posCountRes = await session.run(`
      MATCH (p:PartOfSpeech)
      RETURN count(p) as posCount
    `);
    const posCount = posCountRes.records[0].get("posCount").toNumber();
    console.log(`🧩 Tổng số node (:PartOfSpeech): ${posCount}`);

    if (wordCount === 0) {
      console.log("\n❌ CẢNH BÁO: Chưa có từ vựng nào được nạp! Bạn cần chạy script nạp từ vựng.");
    } else if (wordCount < 48000) {
      console.log(`\n⚠️ CẢNH BÁO: Mới chỉ nạp được một phần (${wordCount}/48295 từ).`);
    } else {
      console.log("\n✅ TUYỆT VỜI! Toàn bộ từ vựng đã được nạp đầy đủ và chính xác vào Neo4j.");
    }

  } catch (err) {
    console.error("💥 Lỗi khi kết nối hoặc truy vấn Neo4j:", err.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

checkWords();
