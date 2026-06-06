/**
 * ai-core-microservice/database/neo4j.js
 * 
 * Centralized Neo4j Driver Connection for the AI Microservice.
 */
const neo4j = require("neo4j-driver");
const graphConfig = require("../config/graph.config");

const driver = neo4j.driver(
  graphConfig.neo4j.uri,
  neo4j.auth.basic(graphConfig.neo4j.username, graphConfig.neo4j.password)
);

// Self-check connectivity on startup
(async () => {
  try {
    await driver.verifyConnectivity();
    console.log("✅ Connected to Neo4j Database");
  } catch (err) {
    console.error("❌ Neo4j Connection Error:", err.message);
  }
})();

module.exports = driver;
