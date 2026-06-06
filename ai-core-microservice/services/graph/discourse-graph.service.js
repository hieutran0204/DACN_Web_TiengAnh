/**
 * services/graph/discourse-graph.service.js
 * 
 * Manages the temporary Semantic Discourse Graph for essay coherence analysis.
 */
const driver = require("../../database/neo4j");

class DiscourseGraphService {
  /**
   * Build a temporary discourse graph for the current essay
   */
  async buildDiscourseGraph(studentId, essayId, sentences) {
    const session = driver.session();
    try {
      // 1. Cleanup old temporary graph for this essay (if any)
      await session.run(
        `MATCH (s:Sentence {essayId: $essayId}) DETACH DELETE s`,
        { essayId }
      );

      // 2. Create sentence nodes and chain them
      for (let i = 0; i < sentences.length; i++) {
        const sent = sentences[i];
        await session.run(
          `
          CREATE (s:Sentence {
            text: $text,
            role: $role,
            index: $index,
            embedding: $embedding,
            essayId: $essayId,
            studentId: $studentId
          })
          WITH s
          MATCH (prev:Sentence {index: $index - 1, essayId: $essayId})
          CREATE (prev)-[:NEXT_SENTENCE]->(s)
          `,
          {
            text: sent.sentence,
            role: sent.discourse_role,
            index: i,
            embedding: sent.embedding || [],
            essayId,
            studentId
          }
        );
      }

      console.log(`⛓️ Discourse Graph built for essay ${essayId} with ${sentences.length} nodes.`);
    } catch (err) {
      console.error("❌ Error building discourse graph:", err.message);
    } finally {
      await session.close();
    }
  }

  /**
   * Run Cypher queries to detect logical gaps
   */
  async validateCoherence(essayId) {
    const session = driver.session();
    const issues = [];

    try {
      // ISSUE 1: Missing Topic Sentence
      const resTopic = await session.run(
        `
        MATCH (s:Sentence {essayId: $essayId})
        WITH count(s) as total, collect(s.role) as roles
        RETURN total, roles
        `,
        { essayId }
      );
      
      const roles = resTopic.records[0].get("roles");
      if (!roles.includes("topic_sentence")) {
        issues.push({
          type: "COHERENCE_GAP",
          message: "Đoạn văn thiếu câu chủ đề (Topic Sentence) rõ ràng.",
          severity: "major"
        });
      }

      // ISSUE 2: Example before Supporting Detail
      const resOrder = await session.run(
        `
        MATCH (s1:Sentence {essayId: $essayId, role: 'example'})-[:NEXT_SENTENCE]->(s2:Sentence {role: 'supporting_detail'})
        RETURN s1, s2
        `,
        { essayId }
      );
      
      if (resOrder.records.length > 0) {
        issues.push({
          type: "LOGIC_ORDER",
          message: "Mạch lập luận bị ngược: Bạn đang đưa ví dụ trước khi giải thích luận điểm.",
          severity: "medium"
        });
      }

      // ISSUE 3: Too many supporting details without examples (Lack of evidence)
      const resEvidence = await session.run(
        `
        MATCH (s:Sentence {essayId: $essayId, role: 'supporting_detail'})
        WHERE NOT EXISTS {
          MATCH (s)-[:NEXT_SENTENCE*1..2]->(:Sentence {role: 'example'})
        }
        RETURN count(s) as unsupportedCount
        `,
        { essayId }
      );

      const unsupportedCount = resEvidence.records[0].get("unsupportedCount").toNumber();
      if (unsupportedCount >= 2) {
        issues.push({
          type: "LACK_OF_EVIDENCE",
          message: "Các luận điểm của bạn đang thiếu ví dụ minh họa cụ thể để tăng tính thuyết phục.",
          severity: "medium"
        });
      }

    } catch (err) {
      console.error("❌ Error validating coherence:", err.message);
    } finally {
      await session.close();
      return issues;
    }
  }
}

module.exports = new DiscourseGraphService();
