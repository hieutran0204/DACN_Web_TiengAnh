require("dotenv").config();
const neo4j = require("neo4j-driver");

async function checkGraph() {
  const driver = neo4j.driver(
    process.env.NEO4J_URI || "bolt://localhost:7687",
    neo4j.auth.basic(process.env.NEO4J_USERNAME || "neo4j", process.env.NEO4J_PASSWORD || "password123")
  );

  const session = driver.session();

  try {
    console.log("🔍 Đang kiểm tra trạng thái đồ thị Neo4j...");

    // 1. Đếm tổng số Node theo Label
    const nodeCount = await session.run(`
      MATCH (n)
      RETURN labels(n) as labels, count(*) as count
    `);
    
    console.log("\n--- THỐNG KÊ NODE ---");
    nodeCount.records.forEach(r => {
      console.log(`Label: ${r.get('labels').join(', ')} | Số lượng: ${r.get('count')}`);
    });

    // 2. Đếm các quan hệ (Relationships)
    const relCount = await session.run(`
      MATCH ()-[r]->()
      RETURN type(r) as type, count(*) as count
    `);

    console.log("\n--- THỐNG KÊ QUAN HỆ (RELATIONSHIPS) ---");
    if (relCount.records.length === 0) {
      console.log("❌ KHÔNG TÌM THẤY QUAN HỆ NÀO! (Graph đang bị rời rạc)");
    } else {
      relCount.records.forEach(r => {
        console.log(`Type: ${r.get('type')} | Số lượng: ${r.get('count')}`);
      });
    }

    // 3. Kiểm tra các KnowledgePoint có được nối với KnowledgeChunk không
    const connectionCheck = await session.run(`
      MATCH (c:KnowledgeChunk)-[r:MENTIONS]->(p:KnowledgePoint)
      RETURN count(r) as connections
    `);
    console.log(`\n🔗 Kết nối Chunk -> Point: ${connectionCheck.records[0].get('connections')}`);

  } catch (err) {
    console.error("💥 Lỗi kết nối Neo4j:", err.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

checkGraph();
