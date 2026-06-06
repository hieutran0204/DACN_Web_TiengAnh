require('dotenv').config({ path: '../.env' });
const { Neo4jGraph } = require("@langchain/community/graphs/neo4j_graph");

async function createIndex() {
    try {
        const graph = await Neo4jGraph.initialize({
            url: process.env.NEO4J_URI || "bolt://localhost:7687",
            username: process.env.NEO4J_USERNAME || "neo4j",
            password: process.env.NEO4J_PASSWORD || "password123",
        });

        console.log("Creating Fulltext Index...");
        await graph.query(`
            CREATE FULLTEXT INDEX knowledge_chunks IF NOT EXISTS 
            FOR (n:KnowledgeChunk) ON EACH [n.text]
        `);
        console.log("✅ Index 'knowledge_chunks' created successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Error:", e.message);
        process.exit(1);
    }
}

createIndex();
