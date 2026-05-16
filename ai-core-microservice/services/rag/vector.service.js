/**
 * services/rag/vector.service.js
 *
 * 🔵 Vector Retrieval Layer
 *
 * Uses LOCAL Ollama (nomic-embed-text) for stable, offline embedding.
 * No API keys needed. 768 dimensions — perfect for Neo4j.
 */

const { Neo4jVectorStore } = require("@langchain/community/vectorstores/neo4j_vector");
const { OllamaEmbeddings }  = require("@langchain/ollama");
const graphConfig = require("../../config/graph.config");

// --- Ollama Local Embeddings ---
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});

let vectorStore = null;

// ─────────────────────────────────────────────────────────────────────────────

class VectorService {
  async search(essayText) {
    if (!essayText) return [];

    try {
      if (!vectorStore) {
        console.log("🔌 Đang kết nối Ollama Vector Store...");
        vectorStore = await Neo4jVectorStore.fromExistingIndex(embeddings, {
          url: graphConfig.neo4j.uri,
          username: graphConfig.neo4j.username,
          password: graphConfig.neo4j.password,
          indexName: "knowledge_vector_index",
          textNodeProperty: "text",
        });
      }

      console.log("📡 Đang truy vấn Ollama Vector Store trong Neo4j...");
      const results = await vectorStore.similaritySearchWithScore(essayText, 6);

      return results.map(([doc, score]) => ({
        text: doc.pageContent,
        score: score,
        metadata: doc.metadata,
      }));
    } catch (err) {
      console.error("❌ Vector search error:", err.message);
      return [];
    }
  }
}

module.exports = new VectorService();
