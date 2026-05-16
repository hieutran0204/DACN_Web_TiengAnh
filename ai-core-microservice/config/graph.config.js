/**
 * config/graph.config.js
 * Neo4j connection & retrieval settings
 */
module.exports = {
  neo4j: {
    uri: process.env.NEO4J_URI || "bolt://localhost:7687",
    username: process.env.NEO4J_USERNAME || "neo4j",
    password: process.env.NEO4J_PASSWORD || "password123",
  },

  retrieval: {
    // Max errors/strengths to pull from graph before calling LLM
    topErrors: 5,
    topStrengths: 3,
    // Min frequency before an error is considered "recurring"
    recurringThreshold: 2,
  },
};
