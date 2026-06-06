/**
 * repositories/essay-graph.repository.js
 * 
 * Responsible for Neo4j interaction: storing sentence structures 
 * and running Vector Similarity algorithms to detect coherence jumps.
 */
const neo4jDriver = require("../database/neo4j");
const neo4j = require("neo4j-driver");

class EssayGraphRepository {
  /**
   * Helper to safely convert Neo4j integers to JS numbers
   */
  _toNumber(val) {
    if (val === null || val === undefined) return 0;
    return neo4j.isInt(val) ? val.toNumber() : val;
  }

  /**
   * LAYER 1: Lưu cấu trúc thô. 
   * Đã thêm bước CLEAN UP để chống trùng lặp Node khi chấm lại (Re-evaluate).
   */
  async saveEssayPipeline(essayId, userId, analyzedSentences) {
    if (!analyzedSentences || analyzedSentences.length === 0) return false;
    
    const session = neo4jDriver.session();
    try {
      // 1. Tạo hoặc lấy Essay node
      await session.run(
        `MERGE (e:Essay {id: $essayId}) 
         ON CREATE SET e.userId = $userId, e.createdAt = timestamp()`,
        { essayId, userId: userId || "anonymous" }
      );

      // 🔥 BƯỚC SỬA ĐỔI CHÍ MẠNG: Dọn dẹp sạch sẽ cấu trúc câu cũ của Essay này
      // Tránh lỗi nhân bản Node (Silent Node Multiplication) khi chạy lại
      await session.run(
        `MATCH (e:Essay {id: $essayId})-[r:HAS_SENTENCE]->(s)
         DETACH DELETE s`,
        { essayId }
      );

      // 2. Tạo cá nhân các Node Sentence và link vào Essay
      for (const sent of analyzedSentences) {
        await session.run(
          `MATCH (e:Essay {id: $essayId})
           MERGE (s:Sentence {id: $sentenceId})
           SET s.index = $index,
               s.text = $text,
               s.root = $root,
               s.markers = $markers,
               s.is_passive = $is_passive,
               s.sentence_type = $sentence_type,
               s.embedding = $embedding,
               s.role = $role
           MERGE (e)-[:HAS_SENTENCE]->(s)`,
          {
            essayId,
            sentenceId: `${essayId}_s${sent.index}`,
            index: sent.index,
            text: sent.text,
            root: sent.root || "",
            markers: sent.markers || [],
            is_passive: !!sent.is_passive,
            sentence_type: sent.sentence_type || "unknown",
            embedding: sent.embedding || [],
            role: sent.role || "Unknown"
          }
        );
      }

      // 3. Tạo quan hệ tuần tự [:NEXT_SENTENCE]
      for (let i = 0; i < analyzedSentences.length - 1; i++) {
        await session.run(
          `MATCH (s1:Sentence {id: $s1Id}), (s2:Sentence {id: $s2Id})
           MERGE (s1)-[:NEXT_SENTENCE]->(s2)`,
          {
            s1Id: `${essayId}_s${analyzedSentences[i].index}`,
            s2Id: `${essayId}_s${analyzedSentences[i+1].index}`
          }
        );
      }
      return true;
    } finally {
      await session.close();
    }
  }

  /**
   * Coherence Scan (Label-Agnostic: Chấp nhận mọi nhãn sau khi thăng hạng)
   */
  async checkCoherenceJumps(essayId, threshold = 0.45) {
    const session = neo4jDriver.session();
    try {
      const cypherQuery = `
        MATCH (e:Essay {id: $essayId})-[:HAS_SENTENCE]->(s1)-[:NEXT_SENTENCE]->(s2)
        WITH s1, s2,
             REDUCE(dot = 0.0, i IN range(0, size(s1.embedding)-1) | dot + s1.embedding[i] * s2.embedding[i]) AS dotProduct,
             sqrt(REDUCE(m1 = 0.0, i IN range(0, size(s1.embedding)-1) | m1 + s1.embedding[i]^2)) AS mag1,
             sqrt(REDUCE(m2 = 0.0, i IN range(0, size(s2.embedding)-1) | m2 + s2.embedding[i]^2)) AS mag2
        WITH s1, s2, (dotProduct / (mag1 * mag2)) AS similarityScore
        WHERE similarityScore < $threshold AND size(s2.markers) = 0
        RETURN s1.index AS cIdx, s1.text AS cText, s2.index AS nIdx, s2.text AS nText, similarityScore AS score
        ORDER BY cIdx ASC
      `;
      const result = await session.run(cypherQuery, { essayId, threshold });
      return result.records.map(record => ({
        type: "COHERENCE_ERROR",
        subType: "LOGIC_JUMP",
        range: { fromSentence: this._toNumber(record.get("cIdx")), toSentence: this._toNumber(record.get("nIdx")) },
        score: record.get("score"),
        details: { sentence1: record.get("cText"), sentence2: record.get("nText") },
        message: `Lập luận bị nhảy cóc giữa câu ${this._toNumber(record.get("cIdx")) + 1} và ${this._toNumber(record.get("nIdx")) + 1}.`
      }));
    } finally {
      await session.close();
    }
  }

  async checkArgumentStructureFlaws(essayId) {
    const session = neo4jDriver.session();
    try {
      const query = `
        MATCH (e:Essay {id: $essayId})-[:HAS_SENTENCE]->(s1)-[:NEXT_SENTENCE]->(s2)
        WHERE s1.role IN ['topic_sentence', 'claim'] AND s2.role IN ['topic_sentence', 'claim'] AND size(s2.markers) = 0
        WITH s1, s2,
             REDUCE(dot = 0.0, i IN range(0, size(s1.embedding)-1) | dot + s1.embedding[i] * s2.embedding[i]) AS dotProduct,
             sqrt(REDUCE(m1 = 0.0, i IN range(0, size(s1.embedding)-1) | m1 + s1.embedding[i]^2)) AS mag1,
             sqrt(REDUCE(m2 = 0.0, i IN range(0, size(s2.embedding)-1) | m2 + s2.embedding[i]^2)) AS mag2
        WITH s1, s2, (dotProduct / (mag1 * mag2)) AS similarityScore
        WHERE similarityScore > 0.85
        RETURN s1.index AS idx1, s2.index AS idx2, s1.text AS txt1, s2.text AS txt2, similarityScore AS score
      `;
      const result = await session.run(query, { essayId });
      return result.records.map(record => ({
        type: "STRUCTURAL_FLAW",
        subType: "REPETITIVE_CLAIM",
        message: `Luận điểm lặp lại tại câu ${this._toNumber(record.get("idx1")) + 1} và ${this._toNumber(record.get("idx2")) + 1}.`,
        details: { sentence1: record.get("txt1"), sentence2: record.get("txt2"), score: record.get("score") }
      }));
    } finally {
      await session.close();
    }
  }

  /**
   * AAE2 Golden Pattern Check: Unsupported Claims (CC Hard Evidence)
   *
   * Pedagogically correct validation:
   * - IELTS essays follow DEDUCTIVE structure: [Topic Sentence] -> [Evidence] -> [Example]
   *   Evidence/Example comes AFTER the Claim, not before.
   * - Scope is PARAGRAPH-level: a Claim is supported if Evidence/Example
   *   appears within 3 sentences after it in the same essay flow.
   * - Exempted roles: hook, thesis, introduction, conclusion, transitional
   *
   * FIX (P2-D): Paragraph-closing claim exemption.
   *   Small LLMs frequently label paragraph-CLOSING sentences as 'topic_sentence'
   *   or 'claim', even though they function as a wrap-up/synthesis sentence.
   *   A sentence that is the LAST in an essay OR immediately followed by a
   *   conclusion/transitional role must never be penalized as "unsupported".
   *   These sentences summarize — they never need an example after them.
   *
   * @param {string} essayId
   * @returns {Array} list of coherence issues
   */
  async checkUnsupportedClaims(essayId) {
    const session = neo4jDriver.session();
    try {
      const EXEMPT_ROLES = ['hook', 'thesis', 'introduction', 'conclusion', 'transitional'];

      // Step 1: Find all Claim-type sentences, excluding structurally exempt roles.
      const claimsResult = await session.run(
        `MATCH (e:Essay {id: $essayId})-[:HAS_SENTENCE]->(claim:Sentence)
         WHERE claim.role IN ['topic_sentence', 'claim']
           AND NOT claim.role IN $exemptRoles
         RETURN claim.index AS idx, claim.text AS text
         ORDER BY idx ASC`,
        { essayId, exemptRoles: EXEMPT_ROLES }
      );

      if (claimsResult.records.length === 0) return [];

      // Step 2: Fetch ALL sentences for positional context.
      const allSentResult = await session.run(
        `MATCH (e:Essay {id: $essayId})-[:HAS_SENTENCE]->(s:Sentence)
         RETURN s.index AS idx, s.role AS role
         ORDER BY idx ASC`,
        { essayId }
      );

      const totalSentences = allSentResult.records.length;
      // Map: sentenceIndex -> role for next-sentence role lookup
      const roleByIndex = new Map();
      for (const rec of allSentResult.records) {
        roleByIndex.set(this._toNumber(rec.get('idx')), rec.get('role'));
      }

      const SUPPORT_WINDOW = 3;
      const SUPPORT_ROLES = ['supporting_detail', 'evidence', 'example'];
      // Roles that signal start of a new section — claim followed only by these is paragraph-final.
      const CLOSING_SIGNAL_ROLES = new Set(['conclusion', 'transitional', 'hook', 'thesis']);

      const supportResult = await session.run(
        `MATCH (e:Essay {id: $essayId})-[:HAS_SENTENCE]->(s:Sentence)
         WHERE s.role IN $supportRoles
         RETURN s.index AS idx`,
        { essayId, supportRoles: SUPPORT_ROLES }
      );

      const supportIndices = new Set(
        supportResult.records.map(r => this._toNumber(r.get('idx')))
      );

      const issues = [];
      for (const rec of claimsResult.records) {
        const claimIdx  = this._toNumber(rec.get('idx'));
        const claimText = rec.get('text');

        // Check A: Support within SUPPORT_WINDOW sentences.
        let hasSupport = false;
        for (let offset = 1; offset <= SUPPORT_WINDOW; offset++) {
          if (supportIndices.has(claimIdx + offset)) { hasSupport = true; break; }
        }
        if (hasSupport) continue;

        // Check B: Paragraph-closing exemption.
        // B1: Last sentence of entire essay — never needs evidence after it.
        const isLastSentence = (claimIdx >= totalSentences - 1);

        // B2: The immediately following sentence (if any) has a closing-signal role,
        //     meaning this claim is the final sentence of a body paragraph.
        const nextRole = roleByIndex.get(claimIdx + 1);
        const isClosingSentence = nextRole && CLOSING_SIGNAL_ROLES.has(nextRole);

        if (isLastSentence || isClosingSentence) {
          console.log(`[AAE2] Sentence ${claimIdx + 1} exempted (paragraph-closing position). nextRole=${nextRole || 'none'}`);
          continue;
        }

        // Genuinely unsupported mid-paragraph claim — flag it.
        issues.push({
          type: 'COHERENCE_ERROR',
          subType: 'UNSUPPORTED_CLAIM',
          range: { fromSentence: claimIdx, toSentence: claimIdx },
          details: { sentence: claimText },
          message: `[AAE2 Chuan Vang] Luan diem tai cau ${claimIdx + 1} chua co dan chung hoac vi du cu the trong ${SUPPORT_WINDOW} cau tiep theo. Hay bo sung Evidence/Example ngay sau luan diem nay.`
        });
      }

      if (issues.length > 0) {
        console.log(`[AAE2 GoldenPattern] Detected ${issues.length} genuinely Unsupported Claim(s) (paragraph-scope + position check).`);
      }
      return issues;
    } catch (err) {
      console.warn('checkUnsupportedClaims failed (non-fatal):', err.message);
      return [];
    } finally {
      await session.close();
    }
  }


  /**
   * LAYER 3: Nâng cấp Đồ thị Tri thức.
   * Đã thêm REMOVE :Sentence để chuẩn hóa trạng thái thực thể.
   */
  async upgradeToKnowledgeGraph(essayId) {
    const session = neo4jDriver.session();
    try {
      console.log(`🏛️ Layer 3: Upgrading Essay [${essayId}] to Argumentation Graph...`);

      // Claim Promotion
      await session.run(`
        MATCH (e:Essay {id: $essayId})-[:HAS_SENTENCE]->(s:Sentence)
        WHERE s.role IN ['topic_sentence', 'claim']
        SET s:Claim
      `, { essayId });

      // Example Promotion
      await session.run(`
        MATCH (e:Essay {id: $essayId})-[:HAS_SENTENCE]->(s:Sentence)
        WHERE s.role = 'example'
        SET s:Example
      `, { essayId });

      // Evidence Promotion
      await session.run(`
        MATCH (e:Essay {id: $essayId})-[:HAS_SENTENCE]->(s:Sentence)
        WHERE s.role = 'supporting_detail' OR s.role = 'evidence'
        SET s:Evidence
      `, { essayId });

      // Logic Relationships [:SUPPORTS]
      await session.run(`
        MATCH (e:Essay {id: $essayId})-[:HAS_SENTENCE]->(c:Claim)-[:NEXT_SENTENCE]->(sent)
        WHERE sent:Evidence OR sent:Example
        MERGE (sent)-[:SUPPORTS]->(c)
      `, { essayId });

      await session.run(`
        MATCH (e:Essay {id: $essayId})-[:HAS_SENTENCE]->(ev1:Evidence)-[:NEXT_SENTENCE]->(ev2:Evidence)
        MERGE (ev2)-[:SUPPORTS]->(ev1)
      `, { essayId });

      // Discourse Markers [:USES_MARKER]
      await session.run(`
        MATCH (e:Essay {id: $essayId})-[:HAS_SENTENCE]->(s)
        WHERE size(s.markers) > 0
        UNWIND s.markers AS marker
        MERGE (dm:DiscourseMarker {name: toLower(marker)})
        MERGE (s)-[:USES_MARKER]->(dm)
      `, { essayId });

      console.log(`✅ Layer 3: Knowledge Graph structuring complete for Essay [${essayId}].`);
      return true;
    } finally {
      await session.close();
    }
  }

  /**
   * Trích xuất mạch lập luận (Sử dụng nhãn sạch)
   */
  async getArgumentationGraphContext(essayId) {
    const session = neo4jDriver.session();
    try {
      const query = `
        MATCH (e:Essay {id: $essayId})-[:HAS_SENTENCE]->(s)
        OPTIONAL MATCH (sub)-[:SUPPORTS]->(s)
        RETURN s.index AS idx, labels(s) AS labels, s.text AS text, collect(sub.index) AS supportedBy
        ORDER BY idx ASC
      `;
      const result = await session.run(query, { essayId });
      
      let contextStr = "--- CURRENT ESSAY ARGUMENTATION GRAPH (LAYER 3) ---\n";
      result.records.forEach(rec => {
        const idx = this._toNumber(rec.get("idx")) + 1;
        // Lọc bỏ nhãn gốc Sentence để hiển thị nhãn tri thức tinh túy
        const labels = rec.get("labels").filter(l => l !== "Sentence").join(", ");
        const text = rec.get("text");
        const supportedBy = rec.get("supportedBy").map(i => `Sentence ${this._toNumber(i) + 1}`).join(", ");
        
        contextStr += `Sentence ${idx} [Type: ${labels}]: "${text}"\n`;
        if (supportedBy.length > 0) {
          contextStr += `   └─ Supported by: ${supportedBy}\n`;
        }
      });
      return contextStr + "--- END CURRENT ESSAY GRAPH ---\n";
    } catch (error) {
        console.error("❌ Graph Context Extraction Error:", error.message);
        return "";
    } finally {
      await session.close();
    }
  }
}

module.exports = new EssayGraphRepository();
