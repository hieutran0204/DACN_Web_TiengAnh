const { Neo4jGraph } = require("@langchain/community/graphs/neo4j_graph");
const { Neo4jVectorStore } = require("@langchain/community/vectorstores/neo4j_vector");
const { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

class GraphRAGService {
  constructor() {
    this.graph = null;
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY,
      temperature: 0,
    });
    
    // Professional Ontology Constants
    this.ALLOWED_LABELS = ['Vocabulary', 'Concept', 'Context', 'ErrorType', 'IELTS_Criteria', 'Sentence', 'Essay', 'Student', 'Strength', 'Idiom', 'Collocation'];
    this.ALLOWED_RELATIONSHIPS = ['EXEMPLIFIES', 'USED_IN', 'VIOLATES', 'LEADS_TO', 'CAUSES', 'SUPPORTS', 'CONTAINS', 'EXPRESSES', 'WROTE', 'HAS_ERROR', 'HAS_STRENGTH', 'MAKES_ERROR', 'MASTERED'];
  }

  async init() {
    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
      try {
        const encryptionRequired = process.env.NEO4J_ENCRYPTED === 'true';
        
        this.graph = await Neo4jGraph.initialize({
          url: process.env.NEO4J_URI,
          username: process.env.NEO4J_USERNAME,
          password: process.env.NEO4J_PASSWORD,
          config: {
            encrypted: encryptionRequired,
            trust: "TRUST_ALL_CERTIFICATES"
          }
        });
        console.log("✅ Neo4j GraphRAG Service: Ready with APOC.");
        await this.graph.refreshSchema();
        return;
      } catch (error) {
        attempt++;
        console.warn(`📡 Neo4j Graph Init Attempt ${attempt} failed: ${error.message}`);
        if (attempt >= maxAttempts) throw error;
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  }

  normalize(text) {
    if (!text) return "";
    return text.toLowerCase().trim();
  }

  /**
   * Master Knowledge Ingestion (Hybrid: Triplet + Vector Chunking)
   */
  async ingestMasterKnowledge(text, category = 'General Knowledge') {
    if (!this.graph) await this.init();

    // ----------------------------------------------------
    // PHASE 1: CHUNKING & VECTOR EMBEDDINGS (LangChain)
    // ----------------------------------------------------
    let chunksAdded = 0;
    const ingestId = `ingest-${Date.now()}`;
    
    try {
      console.log("✂️ Bắt đầu Chunking văn bản...");
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
      });
      const chunks = await splitter.splitText(text);

      const { OllamaEmbeddings } = require("@langchain/ollama");
      const embeddings = new OllamaEmbeddings({
        model: "nomic-embed-text",
        baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      });

      console.log("🧠 Đang tạo Vector Embeddings và lưu vào Neo4j...");
      await Neo4jVectorStore.fromTexts(
        chunks,
        chunks.map((_, i) => ({ ingestId, source: "admin_ingestion", chunkId: i, type: "MasterKnowledge", category: category })),
        embeddings,
        {
          url: process.env.NEO4J_URI,
          username: process.env.NEO4J_USERNAME,
          password: process.env.NEO4J_PASSWORD,
          nodeLabel: "KnowledgeChunk",
          textNodeProperties: ["text"],
          indexName: "knowledge_vector_index",
          embeddingNodeProperty: "embedding"
        }
      );
      chunksAdded = chunks.length;
      console.log(`✅ Đã lưu ${chunks.length} chunks dưới dạng Vector.`);
    } catch (err) {
      console.error("❌ Lỗi trong lúc ghi Vector:", err.message);
      // Nếu lặp lỗi vector, ta vẫn tiếp tục chạy luồng trích xuất Triplet.
    }

    // ----------------------------------------------------
    // PHASE 2: TRIPLET EXTRACTION (GraphRAG Ontology)
    // ----------------------------------------------------
    console.log(`🕸 Trích xuất Triplet cho [${category}]...`);
    
    // Tùy biến chỉ dẫn cho LLM dựa trên loại tri thức (Hỗ trợ cả Tiếng Anh & Tiếng Việt)
    let specialInstructions = "Focus on general factual rules and definitions.";
    const catLower = category.toLowerCase();

    if (catLower.includes("bài mẫu") || catLower.includes("sample")) {
      specialInstructions = "Identify the structures, key arguments, and specific high-level vocabulary used in this essay. Link the Essay to the Concepts it demonstrates using EXEMPLIFIES.";
    } else if (catLower.includes("ngữ pháp") || catLower.includes("grammar")) {
      specialInstructions = "Focus on grammatical rules, syntax structures, and common usage cases. Link rules to IELTS_Criteria (especially GRA).";
    } else if (catLower.includes("từ vựng") || catLower.includes("vocab") || catLower.includes("thành ngữ") || catLower.includes("idiom")) {
      specialInstructions = "Focus on definitions, synonyms, collocations, and register (formal/informal). Link vocabulary to Lexical Resource criteria.";
    } else if (catLower.includes("criteria") || catLower.includes("band_descriptors")) {
      specialInstructions = "Define clearly the requirements for each band level. Link these criteria to specific ErrorTypes or Strengths that affect the score.";
    }

    const prompt = `
    You are an expert IELTS curriculum designer.
    Task: Analyze the content regarding [${category.toUpperCase()}] and extract Master Knowledge triplets.
    Specific Focus: ${specialInstructions}

    ALLOWED LABELS: Concept, GrammarPoint, VocabLevel, IELTS_Criteria, BandScore, SampleEssay, Idiom
    ALLOWED RELATIONSHIPS: PART_OF, REQUIRED_FOR, EXEMPLIFIES, DEFINES, LEADS_TO_HIGH_SCORE, SYNONYM_OF, USED_WITH

    FORMAT: Return ONLY a JSON:
    {
      "triplets": [
        {
          "subject": {"label": "...", "name": "..."},
          "relationship": "...",
          "object": {"label": "...", "name": "..."},
          "confidence": 0.9
        }
      ],
      "summary": "..."
    }

    CONTENT:
    """${text}"""
    `;

    try {
      const response = await this.model.invoke(prompt);
      const cleanedJson = response.content.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanedJson);
      
      // Normalize names
      if (parsed.triplets) {
        for (const t of parsed.triplets) {
          t.subject.name = this.normalize(t.subject.name);
          t.object.name = this.normalize(t.object.name);
          t.relationship = t.relationship.toUpperCase().trim();
        }
      }

      // Phase 3: LINK GRAPH <-> CHUNK (SỬA LỖI: Luôn ưu tiên SET category)
      for (const t of parsed.triplets) {
        const query = `
          // 1. Tạo hoặc cập nhật các hạt tri thức và gán Category
          CALL apoc.merge.node([$sLabel, 'KnowledgePoint'], {name: $sName}) YIELD node AS s
          CALL apoc.merge.node([$oLabel, 'KnowledgePoint'], {name: $oName}) YIELD node AS o
          SET s.category = $category, o.category = $category
          
          WITH s, o // ✅ BẮT BUỘC: Chuyển tiếp s, o sang lệnh tiếp theo
          
          // 2. Tạo quan hệ giữa chúng
          CALL apoc.merge.relationship(s, $rel, {}, {}, o) YIELD rel
          
          // 3. Cố gắng kết nối với đoạn văn bản gốc (Chunks) nếu tìm thấy
          WITH s, o // ✅ BẮT BUỘC
          OPTIONAL MATCH (c:KnowledgeChunk {ingestId: $ingestId})
          SET c.category = $category
          
          WITH s, o, c // ✅ BẮT BUỘC
          WHERE c IS NOT NULL
          MERGE (c)-[:MENTIONS]->(s)
          MERGE (c)-[:MENTIONS]->(o)

          RETURN count(*)
        `;
        try {
          await this.graph.query(query, {
            ingestId: ingestId,
            category: category,
            sLabel: t.subject.label || 'Concept',
            sName: t.subject.name,
            oLabel: t.object.label || 'Concept',
            oName: t.object.name,
            rel: t.relationship
          });
        } catch (err) {
          console.error("❌ Knowledge Ingest APOC Error:", err.message);
        }
      }

      return {
        message: "Nạp tri thức Hybrid (Vector + Graph) thành công!",
        summary: parsed.summary,
        chunksAdded: chunksAdded,
        tripletsAdded: parsed.triplets.length,
        data: parsed.triplets
      };
    } catch (error) {
      console.error("❌ Master Ingest Failed:", error);
      throw new Error("Lỗi khi nạp tri thức: " + error.message);
    }
  }

  /**
   * REASONING LAYER (Phase 4 & 5): Hybrid RAG Query
   * Sự kết hợp (Fusion) giữa Vector Semantic Search và Graph Expansion.
   */
  async hybridQuery(text) {
    if (!this.graph) await this.init();
    
    console.log(`📡 Đang thực hiện Hybrid Query (Vector + Graph) cho: "${text.substring(0, 50)}..."`);
    
    try {
      // 1. Dùng Full-text Search để tìm các KnowledgePoint liên quan trực tiếp
      const initialNodes = await this.graph.query(`
        CALL db.index.fulltext.queryNodes("knowledge_chunks", $text) YIELD node, score
        MATCH (node)-[:MENTIONS]->(p:KnowledgePoint)
        RETURN p.name as name, labels(p) as labels, score
        ORDER BY score DESC LIMIT 3
      `, { text });

      if (initialNodes.length === 0) return "";

      // 2. Với mỗi Node tìm được, "leo" qua các quan hệ để tìm kiến thức liên quan (Graph Expansion)
      const names = initialNodes.map(n => n.name);
      const graphContext = await this.graph.query(`
        MATCH (p:KnowledgePoint)
        WHERE p.name IN $names
        MATCH (p)-[r:DEFINES|REQUIRED_FOR|EXEMPLIFIES|SYNONYM_OF]-(related)
        RETURN p.name as source, type(r) as rel, related.name as target, labels(related) as targetLabel
        LIMIT 10
      `, { names });

      // 3. Tổng hợp thành chuỗi tri thức cho AI
      let context = "--- RELATIVE KNOWLEDGE FROM GRAPH ---\n";
      graphContext.forEach(row => {
        context += `- [${row.source}] ${row.rel} [${row.target}] (${row.targetLabel})\n`;
      });

      return context;
    } catch (err) {
      console.warn("⚠️ Hybrid Query failed:", err.message);
      return "";
    }
  }

  /**
   * Advanced Triplet Extraction - Personalized & Historical Aware
   */
  async extractTriplets(text, studentId = null, historyContext = "", ragContext = "") {
    const prompt = `
    You are an expert IELTS examiner and knowledge graph builder.
    Task: Analyze the essay and extract structured triplets for a reasoning graph.

    CRITICAL RULES FROM KNOWLEDGE BASE (USE THESE AS SOURCE OF TRUTH):
    ${ragContext || "Apply official band descriptors."}

    STUDENT HISTORY: ${historyContext || "New student, no history."}

    RULES:
    1. Focus on Vocabulary, Context appropriateness, Error detection, and IELTS Criteria.
    2. Identify "High-Level Language Features": Extract advanced vocabulary (C1/C2), idioms, and complex collocations that contribute to a high score.
    3. If a vocabulary is correct but used in wrong context -> VIOLATES.
    4. If misuse occurs -> create ErrorType node and link with LEADS_TO.
    5. If high-level feature is used correctly -> create link to a Strength node or use MASTERED relationship.
    6. Each sentence should ideally be a node linked to the essay.

    ALLOWED LABELS: ${this.ALLOWED_LABELS.join(', ')}
    ALLOWED RELATIONSHIPS: ${this.ALLOWED_RELATIONSHIPS.join(', ')}

    FORMAT: Return ONLY a JSON matching this structure:
    {
      "triplets": [
        {
          "subject": {"label": "...", "name": "..."},
          "relationship": "...",
          "object": {"label": "...", "name": "..."},
          "confidence": 0.9,
          "is_uncertain": false
        }
      ],
      "overall_score": {"lexical": 5, "coherence": 5, "grammar": 5, "task_response": 5},
      "feedback": "..."
    }

    ESSAY TO ANALYZE:
    """${text}"""
    `;

    try {
      const response = await this.model.invoke(prompt);
      const cleanedJson = response.content.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanedJson);
      
      // Normalize names
      if (parsed.triplets) {
        parsed.triplets = parsed.triplets.map(t => ({
          ...t,
          subject: { ...t.subject, name: this.normalize(t.subject.name) },
          object: { ...t.object, name: this.normalize(t.object.name) },
          relationship: t.relationship.toUpperCase().trim()
        }));
      }
      return parsed;
    } catch (error) {
      console.error("❌ Extraction Failed:", error);
      return { triplets: [], feedback: "Error processing essay." };
    }
  }

  /**
   * Get Student History for Personalization
   */
  async getStudentHistory(studentId) {
    if (!this.graph) await this.init();
    const query = `
      MATCH (s:Student {studentId: $studentId})-[r:MAKES_ERROR]->(e:ErrorType)
      RETURN e.name as error, r.count as frequency, r.lastSeen as lastSeen
      ORDER BY r.lastSeen DESC, r.count DESC
      LIMIT 5
    `;
    try {
      const results = await this.graph.query(query, { studentId });
      return results.map(r => `${r.error} (seen ${r.frequency} times, last: ${r.lastSeen})`).join(", ");
    } catch (e) {
      return "";
    }
  }

  /**
   * Main Personalized Analysis Pipeline
   */
  async analyzeEssay(text, studentId, essayId) {
    if (!this.graph) await this.init();

    // 1. Retrieve History
    const history = await this.getStudentHistory(studentId);

    // 2. Retrieve Relevant Context from GraphRAG (The "RAG" part)
    console.log("🔍 Tìm kiếm tri thức liên quan từ Hybrid GraphRAG...");
    let ragContext = "";
    try {
      ragContext = await this.hybridQuery(text);
      
      // Bổ sung thêm vector search thô nếu graph context quá ít
      if (ragContext.length < 100) {
        const vectorResults = await this.graph.query(`
          CALL db.index.fulltext.queryNodes("knowledge_chunks", $text) YIELD node, score
          RETURN node.text as chunk, score
          ORDER BY score DESC LIMIT 3
        `, { text });
        ragContext += "\n--- ADDITIONAL TEXT CONTEXT ---\n" + vectorResults.map(r => r.chunk).join("\n");
      }
    } catch (err) {
      console.warn("⚠️ Không tìm thấy ngữ cảnh RAG, dùng kiến thức AI mặc định.");
    }

    // 3. Extract & Analyze with RAG Context
    const analysis = await this.extractTriplets(text, studentId, history, ragContext);

    // 3. Update Graph (Temporal Ingestion)
    await this.graph.query(`MERGE (s:Student {studentId: $studentId})`, { studentId });
    await this.graph.query(`MERGE (e:Essay {essayId: $essayId}) SET e.studentId = $studentId, e.timestamp = datetime()`, { essayId, studentId });
    await this.graph.query(`MATCH (s:Student {studentId: $studentId}), (e:Essay {essayId: $essayId}) MERGE (s)-[:WROTE]->(e)`, { studentId, essayId });

    for (const t of analysis.triplets) {
      // Use APOC for dynamic labels
      const query = `
        MATCH (e:Essay {essayId: $essayId})
        MATCH (st:Student {studentId: $studentId})
        CALL apoc.merge.node([$sLabel], {name: $sName}) YIELD node AS s
        CALL apoc.merge.node([$oLabel], {name: $oName}) YIELD node AS o
        CALL apoc.merge.relationship(s, $rel, {}, {}, o) YIELD rel
        
        // Link Essay to concepts
        MERGE (e)-[:CONTAINS]->(s)
        MERGE (e)-[:CONTAINS]->(o)

        // Temporal Student Memory for Errors
        WITH e, st, s, o, rel
        WHERE ($rel = 'LEADS_TO' OR $rel = 'HAS_ERROR') AND $oLabel = 'ErrorType'
        MERGE (st)-[me:MAKES_ERROR]->(o)
        ON CREATE SET me.count = 1, me.firstSeen = datetime(), me.lastSeen = datetime()
        ON MATCH SET me.count = me.count + 1, me.lastSeen = datetime()

        // Track Strength (General)
        WITH e, st, s, o, rel
        WHERE ($rel = 'SUPPORTS' OR $rel = 'HAS_STRENGTH' OR $rel = 'EXEMPLIFIES') AND $oLabel = 'Strength'
        MERGE (st)-[hs:HAS_STRENGTH]->(o)
        ON CREATE SET hs.score = 0.5, hs.lastSeen = datetime()
        ON MATCH SET hs.score = hs.score + 0.1, hs.lastSeen = datetime()
        
        // Track Vocabulary/Idiom Mastery (Personalization)
        WITH e, st, s, o, rel
        WHERE ($sLabel = 'Vocabulary' OR $sLabel = 'Idiom' OR $sLabel = 'Collocation') AND $rel = 'USED_IN'
        MERGE (st)-[m:MASTERED]->(s)
        ON CREATE SET m.count = 1, m.level = 'Detected', m.lastUsed = datetime()
        ON MATCH SET m.count = m.count + 1, m.lastUsed = datetime()

        // Track Essay Error Timeline
        WITH e, s, o, rel
        WHERE $oLabel = 'ErrorType'
        MERGE (e)-[:HAS_ERROR]->(o)
      `;

      try {
        await this.graph.query(query, {
          essayId,
          studentId,
          sLabel: t.subject.label || 'Concept',
          sName: t.subject.name,
          oLabel: t.object.label || 'Concept',
          oName: t.object.name,
          rel: t.relationship
        });
      } catch (err) {
        console.error("❌ APOC Ingest Error:", err.message);
      }
    }

    return {
      score: analysis.overall_score,
      feedback: analysis.feedback,
      tripletsCount: analysis.triplets.length
    };
  }

  /**
   * Get Reasoning Path for a Specific Essay (Enhanced)
   */
  async getReasoningPath(essayId) {
    if (!this.graph) await this.init();
    // Tìm bất kỳ con đường nào từ Essay tới IELTS_Criteria qua tối đa 3 bước
    const query = `
      MATCH (e:Essay {essayId: $essayId})-[:CONTAINS|HAS_ERROR|HAS_STRENGTH*1..3]-(crit:IELTS_Criteria)
      MATCH (e)-[:CONTAINS|HAS_ERROR]-(issue)
      MATCH (issue)-[:CAUSES|VIOLATES|LEADS_TO]-(crit)
      RETURN DISTINCT issue.name as element, crit.name as criteria, crit.description as impact
      LIMIT 10
    `;
    try {
      return await this.graph.query(query, { essayId });
    } catch (e) {
      console.error("❌ Reasoning Path Error:", e.message);
      return [];
    }
  }

  /**
   * Get Full Student Progress Report
   */
  async getStudentReport(studentId) {
    if (!this.graph) await this.init();
    const topErrors = await this.graph.query(`
      MATCH (s:Student {studentId: $studentId})-[r:MAKES_ERROR]->(e:ErrorType)
      RETURN e.name as name, r.count as count, r.lastSeen as lastSeen
      ORDER BY r.count DESC LIMIT 5
    `, { studentId });

    const strengths = await this.graph.query(`
      MATCH (s:Student {studentId: $studentId})-[r:HAS_STRENGTH]->(st:Strength)
      RETURN st.name as name, r.score as score
      ORDER BY r.score DESC LIMIT 5
    `, { studentId });

    return { studentId, topErrors, strengths };
  }

  /**
   * Lấy toàn bộ tên từ vựng trong Graph để đồng bộ với RuleBasedService
   */
  async getAllWordNames() {
    if (!this.driver && !this.graph) await this.init();
    const query = `MATCH (w:Word) RETURN w.name as name`;
    try {
      const results = await this.graph.query(query);
      return results.map(r => r.name);
    } catch (e) {
      console.error("❌ Lỗi lấy danh sách từ vựng từ Graph:", e.message);
      return [];
    }
  }
}

module.exports = new GraphRAGService();
