/**
 * config/vector.config.js
 * Vector search settings (for future Pinecone / pgvector integration)
 */
module.exports = {
  topK: 5,
  similarityThreshold: 0.75,
  // When vector DB is ready, set the provider here: "pinecone" | "pgvector" | "mock"
  provider: process.env.VECTOR_PROVIDER || "mock",
};
