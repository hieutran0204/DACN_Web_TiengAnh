/**
 * services/graph/memory.service.js
 * 
 * 🧠 Phase 1: GRAPH RETRIEVAL — Pull student's historical memory from Neo4j
 * BEFORE the LLM is called. This is the core of true GraphRAG.
 *
 * Responsibilities:
 *  - getStudentMemory(studentId)  → top recurring errors + strengths
 *  - updateStudentMemory(...)     → write back after LLM result
 */

const { Neo4jGraph } = require("@langchain/community/graphs/neo4j_graph");
const graphConfig = require("../../config/graph.config");

class MemoryService {
  constructor() {
    this.graph = null;
  }

  async _getGraph() {
    if (!this.graph) {
      const maxAttempts = 3;
      let attempt = 0;

      while (attempt < maxAttempts) {
        try {
          // 🛡️ Cấu hình bảo mật cao cho báo cáo đồ án
          const encryptionRequired = process.env.NEO4J_ENCRYPTED === 'true';
          
          this.graph = await Neo4jGraph.initialize({
            url: graphConfig.neo4j.uri,
            username: graphConfig.neo4j.username,
            password: graphConfig.neo4j.password,
            config: {
              encrypted: encryptionRequired, // Mặc định đi theo cấu hình .env (nên là true khi báo cáo)
              trust: "TRUST_ALL_CERTIFICATES" // Giúp kết nối ổn định hơn với các chứng chỉ tự ký
            }
          });
          console.log("✅ Neo4j GraphRAG Memory Service: Connected.");
          break;
        } catch (err) {
          attempt++;
          console.warn(`📡 Neo4j Connection Attempt ${attempt} failed. Retrying...`);
          if (attempt >= maxAttempts) throw err;
          await new Promise(res => setTimeout(res, 3000));
        }
      }
    }
    return this.graph;
  }

  /**
   * 🔵 PHASE 1: Retrieve student memory (errors + strengths)
   * Called BEFORE LLM to build contextual prompt
   */
  async getStudentMemory(studentId) {
    if (!studentId) return { errors: [], strengths: [], summary: "" };

    try {
      const graph = await this._getGraph();
      const { topErrors, topStrengths } = graphConfig.retrieval;

      const [errors, strengths] = await Promise.all([
        graph.query(
          `MATCH (s:Student {studentId: $studentId})-[r:MAKES_ERROR]->(e:ErrorType)
           RETURN e.name AS error, r.count AS count, r.lastSeen AS lastSeen
           ORDER BY r.count DESC, r.lastSeen DESC
           LIMIT ${topErrors}`,
          { studentId }
        ),
        graph.query(
          `MATCH (s:Student {studentId: $studentId})-[r:HAS_STRENGTH]->(st:Strength)
           RETURN st.name AS strength, r.score AS score
           ORDER BY r.score DESC
           LIMIT ${topStrengths}`,
          { studentId }
        ),
      ]);

      return {
        errors,      // [{ error, count, lastSeen }]
        strengths,   // [{ strength, score }]
        hasHistory: errors.length > 0 || strengths.length > 0,
      };
    } catch (err) {
      console.warn("⚠️ getStudentMemory failed (non-fatal):", err.message);
      return { errors: [], strengths: [], hasHistory: false };
    }
  }

  /**
   * 🟣 PHASE 2: Update graph with new triplets extracted from LLM result
   * Called AFTER LLM response
   */
  async updateStudentMemory(studentId, essayId, triplets = []) {
    if (!studentId || !essayId || triplets.length === 0) return;

    try {
      const graph = await this._getGraph();

      // Ensure Student + Essay nodes exist
      await graph.query(`MERGE (s:Student {studentId: $studentId})`, { studentId });
      await graph.query(
        `MERGE (e:Essay {essayId: $essayId})
         SET e.studentId = $studentId, e.timestamp = datetime(), e.content = $content`,
        { essayId, studentId, content: triplets.originalText || "" }
      );
      await graph.query(
        `MATCH (s:Student {studentId: $studentId}), (e:Essay {essayId: $essayId})
         MERGE (s)-[:WROTE]->(e)`,
        { studentId, essayId }
      );

      // Ingest each triplet
      for (const t of triplets) {
        try {
          await graph.query(
            `MATCH (e:Essay {essayId: $essayId}), (st:Student {studentId: $studentId})
             CALL apoc.merge.node([$sLabel], {name: $sName}) YIELD node AS s
             CALL apoc.merge.node([$oLabel], {name: $oName}) YIELD node AS o
             CALL apoc.merge.relationship(s, $rel, {}, {}, o) YIELD rel
             MERGE (e)-[:CONTAINS]->(s)
             MERGE (e)-[:CONTAINS]->(o)
             WITH e, st, s, o, rel
             WHERE ($rel = 'LEADS_TO' OR $rel = 'HAS_ERROR') AND $oLabel = 'ErrorType'
             MERGE (st)-[me:MAKES_ERROR]->(o)
             ON CREATE SET me.count = 1, me.firstSeen = datetime(), me.lastSeen = datetime()
             ON MATCH  SET me.count = me.count + 1, me.lastSeen = datetime()`,
            {
              essayId,
              studentId,
              sLabel: t.subject?.label || "Concept",
              sName:  t.subject?.name  || "unknown",
              oLabel: t.object?.label  || "Concept",
              oName:  t.object?.name   || "unknown",
              rel:    t.relationship   || "RELATED_TO",
            }
          );
        } catch (tripletErr) {
          console.error("❌ Triplet ingest error:", tripletErr.message);
        }
      }

      console.log(`✅ Graph updated for student ${studentId}, essay ${essayId} (${triplets.length} triplets)`);
    } catch (err) {
      console.error("❌ updateStudentMemory failed:", err.message);
    }
  }

  /**
   * 🟢 NEW: Get full student profile for Dashboard
   */
  async getStudentProfile(studentId) {
    if (!studentId) return null;

    try {
      const graph = await this._getGraph();

      const [errors, strengths, essays] = await Promise.all([
        // Top errors
        graph.query(
          `MATCH (s:Student {studentId: $studentId})-[r:MAKES_ERROR]->(e:ErrorType)
           RETURN e.name AS error, r.count AS count, r.lastSeen AS lastSeen
           ORDER BY r.count DESC LIMIT 5`,
          { studentId }
        ),
        // Top strengths
        graph.query(
          `MATCH (s:Student {studentId: $studentId})-[r:HAS_STRENGTH]->(st:Strength)
           RETURN st.name AS strength, r.score AS score
           ORDER BY r.score DESC LIMIT 5`,
          { studentId }
        ),
        // Recent activity
        graph.query(
          `MATCH (s:Student {studentId: $studentId})-[:WROTE]->(e:Essay)
           RETURN e.essayId AS essayId, e.timestamp AS timestamp
           ORDER BY e.timestamp DESC LIMIT 10`,
          { studentId }
        )
      ]);

      return {
        studentId,
        stats: {
          totalEssays: essays.length,
          topErrors: errors,
          topStrengths: strengths,
          recentEssays: essays
        }
      };
    } catch (err) {
      console.error("❌ getStudentProfile failed:", err.message);
      return null;
    }
  }
}

module.exports = new MemoryService();
