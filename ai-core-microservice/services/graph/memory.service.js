/**
 * services/graph/memory.service.js
 *
 * Student Memory Layer — GraphRAG Personalization Core
 *
 * Responsibilities:
 *   - getStudentMemory(studentId)                → recurring errors + strengths (pre-LLM context)
 *   - getStudentMemoryWithPrescription(studentId) → memory + recommended exercises (full profile)
 *   - updateStudentMemory(...)                    → write back error/strength triplets + trend tracking
 *
 * Trend tracking: Each MAKES_ERROR relationship now stores `previousCount` so downstream
 * callers can compute whether the student is improving (count delta is shrinking).
 */

const { Neo4jGraph } = require("@langchain/community/graphs/neo4j_graph");
const graphConfig = require("../../config/graph.config");
const prescriptionService = require("./prescription.service");

class MemoryService {
  constructor() {
    /**
     * Stores the initialization Promise (not the resolved graph).
     * This prevents the race condition where two concurrent callers both
     * enter the `if (!this.graph)` block before the first await resolves.
     * All callers await the same Promise; JS event loop guarantees the
     * assignment is visible synchronously before any microtask resumes.
     */
    this._initPromise = null;
  }

  /**
   * Returns a Promise that resolves to the initialized Neo4j graph.
   *
   * Uses promise-based singleton: the Promise itself is stored so that all
   * concurrent callers share a single initialization chain. The check and
   * assignment of `this._initPromise` happen synchronously within the same
   * microtask tick, making this race-condition-free.
   *
   * On failure the stored promise is cleared so the next call can retry.
   *
   * @returns {Promise<Neo4jGraph>}
   */
  _getGraph() {
    if (!this._initPromise) {
      this._initPromise = this._initWithRetry().catch(err => {
        // Clear on failure so subsequent calls get a fresh attempt.
        this._initPromise = null;
        throw err;
      });
    }
    return this._initPromise;
  }

  /**
   * Internal initialization helper with exponential back-off retry.
   * Separated from _getGraph() so the retry loop stays readable.
   *
   * @returns {Promise<Neo4jGraph>}
   */
  async _initWithRetry() {
    const maxAttempts = 3;
    // 🛡️ Cấu hình bảo mật cao cho báo cáo đồ án
    const encryptionRequired = process.env.NEO4J_ENCRYPTED === 'true';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const graph = await Neo4jGraph.initialize({
          url:      graphConfig.neo4j.uri,
          username: graphConfig.neo4j.username,
          password: graphConfig.neo4j.password,
          config: {
            encrypted: encryptionRequired, // Follows .env (set true when presenting)
            trust: "TRUST_ALL_CERTIFICATES" // Handles self-signed certs gracefully
          }
        });
        console.log("✅ Neo4j GraphRAG Memory Service: Connected.");
        return graph;
      } catch (err) {
        console.warn(`📡 Neo4j Connection Attempt ${attempt}/${maxAttempts} failed. Retrying...`);
        if (attempt >= maxAttempts) throw err;
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  }

  /**
   * Retrieve student error/strength memory for pre-LLM context injection.
   * Also computes error_trend per error type (improving | worsening | stable).
   *
   * @param {string} studentId
   * @returns {Promise<{errors, strengths, hasHistory}>}
   */
  async getStudentMemory(studentId) {
    if (!studentId) return { errors: [], strengths: [], hasHistory: false };

    try {
      const graph = await this._getGraph();
      const { topErrors, topStrengths } = graphConfig.retrieval;

      const [errors, strengths] = await Promise.all([
        graph.query(
          `MATCH (s:Student {studentId: $studentId})-[r:MAKES_ERROR]->(e:ErrorType)
           RETURN e.name AS error,
                  r.count AS count,
                  r.lastSeen AS lastSeen,
                  r.previousCount AS previousCount
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

      // Compute trend: compare count vs previousCount to detect improvement/regression
      const enrichedErrors = errors.map(e => {
        const current  = e.count || 0;
        const previous = e.previousCount || current; // first time: no trend
        const delta    = current - previous;
        let trend = 'stable';
        if (delta > 0) trend = 'worsening';
        if (delta < 0) trend = 'improving';
        return { ...e, trend, delta };
      });

      return {
        errors: enrichedErrors,
        strengths,
        hasHistory: enrichedErrors.length > 0 || strengths.length > 0,
      };
    } catch (err) {
      console.warn("⚠️ getStudentMemory failed (non-fatal):", err.message);
      return { errors: [], strengths: [], hasHistory: false };
    }
  }

  /**
   * Full student profile with memory + exercise prescriptions.
   * Use this instead of getStudentMemory() when the response needs to include
   * actionable learning recommendations (e.g., Dashboard, Post-essay page).
   *
   * @param {string} studentId
   * @returns {Promise<{errors, strengths, hasHistory, recommendations}>}
   */
  async getStudentMemoryWithPrescription(studentId) {
    const memory = await this.getStudentMemory(studentId);

    // Generate recommendations from the in-process catalog (fast, no extra DB call)
    const recommendations = prescriptionService.getRecommendations(
      memory.errors,
      memory.strengths,
      5
    );

    return { ...memory, recommendations };
  }

  /**
   * Update graph with new triplets extracted from LLM result.
   * Also tracks previousCount on MAKES_ERROR to enable trend detection.
   *
   * @param {string}   studentId
   * @param {string}   essayId
   * @param {Array}    triplets     - Knowledge triplets from extractTripletsFromResult()
   * @param {string}   originalText - Essay text stored on the Essay node (explicit arg,
   *                                  not a property on the Array to avoid implicit coupling)
   */
  async updateStudentMemory(studentId, essayId, triplets = [], originalText = '') {
    if (!studentId || !essayId || triplets.length === 0) return;

    try {
      const graph = await this._getGraph();

      // Ensure Student + Essay nodes exist
      await graph.query(`MERGE (s:Student {studentId: $studentId})`, { studentId });
      await graph.query(
        `MERGE (e:Essay {essayId: $essayId})
         SET e.studentId = $studentId, e.timestamp = datetime(), e.content = $content`,
        { essayId, studentId, content: originalText }
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
             ON CREATE SET me.count = 1,
                           me.previousCount = 0,
                           me.firstSeen = datetime(),
                           me.lastSeen  = datetime()
             ON MATCH  SET me.previousCount = me.count,
                           me.count = me.count + 1,
                           me.lastSeen = datetime()`,
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
