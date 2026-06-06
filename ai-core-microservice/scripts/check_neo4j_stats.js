require('dotenv').config({ path: '../.env' });
const { Neo4jGraph } = require("@langchain/community/graphs/neo4j_graph");

async function checkStats() {
    try {
        const graph = await Neo4jGraph.initialize({
            url: process.env.NEO4J_URI || "bolt://localhost:7687",
            username: process.env.NEO4J_USERNAME || "neo4j",
            password: process.env.NEO4J_PASSWORD || "password123",
        });

        console.log("=== THỐNG KÊ ĐỒ THỊ TRI THỨC (NEO4J) ===");
        
        // Count total nodes
        const totalNodes = await graph.query(`MATCH (n) RETURN count(n) AS count`);
        console.log(`- Tổng số Node (Thực thể): ${totalNodes[0].count}`);

        // Count total relationships
        const totalRels = await graph.query(`MATCH ()-[r]->() RETURN count(r) AS count`);
        console.log(`- Tổng số Quan hệ (Relationships): ${totalRels[0].count}`);

        // Nodes by label
        const labels = await graph.query(`MATCH (n) RETURN labels(n)[0] AS label, count(n) AS count ORDER BY count DESC LIMIT 15`);
        console.log("\nTop Labels:");
        labels.forEach(l => {
            if (l.label) console.log(`  * ${l.label}: ${l.count}`);
        });

        // Relationships by type
        const relTypes = await graph.query(`MATCH ()-[r]->() RETURN type(r) AS type, count(r) AS count ORDER BY count DESC LIMIT 10`);
        console.log("\nTop Relationships:");
        relTypes.forEach(r => {
            console.log(`  * ${r.type}: ${r.count}`);
        });

        process.exit(0);
    } catch (e) {
        console.error("Error:", e.message);
        process.exit(1);
    }
}

checkStats();
