/**
 * scripts/seed-neo4j.js
 *
 * Chạy: node scripts/seed-neo4j.js
 *
 * Mục đích:
 *  Xây dựng đồ thị tri thức (Ontology) đa tầng cho IELTS GraphRAG:
 *  1. Tầng 1 (Core Standards): IELTS_Criteria, BandScore
 *  2. Tầng 2 (Expert Knowledge): GrammarPoint, VocabLevel
 *  3. Tầng 3 (Diagnostic): ErrorType, StrengthType
 *  4. Tầng 4 (Student Data): Student, Essay, Attempt
 */

require("dotenv").config();
const { Neo4jGraph } = require("@langchain/community/graphs/neo4j_graph");

const NEO4J_URI      = process.env.NEO4J_URI      || "bolt://localhost:7687";
const NEO4J_USER     = process.env.NEO4J_USERNAME  || "neo4j";
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD  || "password123";

// ── 1. CẤU TRÚC DỮ LIỆU (ONTOLOGY DATA) ───────────────────────────────────────

const IELTS_CRITERIA = [
  { code: "TR",  name: "Task Response",                  description: "How well the essay addresses the task prompt" },
  { code: "CC",  name: "Coherence and Cohesion",         description: "Logical flow and use of cohesive devices" },
  { code: "LR",  name: "Lexical Resource",               description: "Range and accuracy of vocabulary" },
  { code: "GRA", name: "Grammatical Range and Accuracy", description: "Range and accuracy of grammar structures" },
];

const GRAMMAR_POINTS = [
  { id: "SV_AGREE", name: "Subject-Verb Agreement", category: "GRA", minBand: 4.0 },
  { id: "TENSE_CONS", name: "Tense Consistency",     category: "GRA", minBand: 5.0 },
  { id: "PASSIVE",   name: "Passive Voice",          category: "GRA", minBand: 6.0 },
  { id: "COMPLEX",   name: "Complex Sentences",     category: "GRA", minBand: 6.5 },
  { id: "INVERSION", name: "Inversion",              category: "GRA", minBand: 7.5 },
  { id: "COND_MIX",  name: "Mixed Conditionals",     category: "GRA", minBand: 8.0 },
];

const VOCABULARY_POINTS = [
  { id: "BASIC_VOCAB", name: "Basic Vocabulary",     category: "LR", minBand: 4.0 },
  { id: "COHESIVE_D",  name: "Cohesive Devices",     category: "CC", minBand: 5.5 },
  { id: "ACADEMIC_V",  name: "Academic Vocabulary",  category: "LR", minBand: 6.5 },
  { id: "COLLOCATIONS", name: "Natural Collocations", category: "LR", minBand: 7.0 },
  { id: "IDIOMS",      name: "Idiomatic Expressions", category: "LR", minBand: 8.0 },
];

const ERROR_TYPES = [
  { name: "Subject-Verb Error",    refersTo: "SV_AGREE",  description: "Mismatched subject and verb number." },
  { name: "Tense Shift",          refersTo: "TENSE_CONS", description: "Unnecessary change in verb tense." },
  { name: "Fragment Sentence",    refersTo: "COMPLEX",    description: "Incomplete sentence structure." },
  { name: "Repetitive Word Choice", refersTo: "ACADEMIC_V", description: "Using the same simple words too often." },
  { name: "Missing Linkers",      refersTo: "COHESIVE_D", description: "Lack of transition words between ideas." },
];

const TEST_STUDENTS = [
  {
    studentId: "student_001",
    attempts: [
      {
        essayId: "essay_101",
        score: { TR: 6.0, CC: 5.5, LR: 5.0, GRA: 5.5 },
        errors: [
          { type: "Subject-Verb Error", count: 3 },
          { type: "Tense Shift", count: 2 }
        ],
        strengths: ["COHESIVE_D"]
      }
    ]
  }
];

// ── 2. HÀM SEED CHI TIẾT ──────────────────────────────────────────────────────

async function seedCorePillars(graph) {
  console.log("🏛  [L1] Seeding Core Pillars (Criteria & Bands)...");
  
  // Criteria
  for (const c of IELTS_CRITERIA) {
    await graph.query(
      `MERGE (c:IELTS_Criteria {code: $code}) SET c.name = $name, c.description = $description`,
      c
    );
  }

  // Band Scores (1.0 to 9.0)
  for (let b = 1.0; b <= 9.0; b += 0.5) {
    await graph.query(`MERGE (:BandScore {level: $level})`, { level: b });
  }
  console.log("   ✔ Done.");
}

async function seedExpertKnowledge(graph) {
  console.log("🧠 [L2] Seeding Expert Knowledge (Grammar & Vocab)...");

  // Grammar Points
  for (const gp of GRAMMAR_POINTS) {
    await graph.query(`
      MATCH (c:IELTS_Criteria {code: $category})
      MATCH (b:BandScore {level: $minBand})
      MERGE (p:KnowledgePoint:GrammarPoint {id: $id})
      SET p.name = $name
      MERGE (p)-[:PART_OF]->(c)
      MERGE (p)-[:REQUIRED_FOR]->(b)
    `, gp);
  }

  // Vocabulary Points
  for (const vp of VOCABULARY_POINTS) {
    await graph.query(`
      MATCH (c:IELTS_Criteria {code: $category})
      MATCH (b:BandScore {level: $minBand})
      MERGE (p:KnowledgePoint:VocabLevel {id: $id})
      SET p.name = $name
      MERGE (p)-[:PART_OF]->(c)
      MERGE (p)-[:REQUIRED_FOR]->(b)
    `, vp);
  }
  console.log("   ✔ Done.");
}

async function seedDiagnosticModels(graph) {
  console.log("🔍 [L3] Seeding Diagnostic Layer (Error Types)...");
  for (const et of ERROR_TYPES) {
    await graph.query(`
      MATCH (kp:KnowledgePoint {id: $refersTo})
      MERGE (e:ErrorType {name: $name})
      SET e.description = $description
      MERGE (e)-[:REFERS_TO]->(kp)
    `, et);
  }
  console.log("   ✔ Done.");
}

async function seedStudentData(graph) {
  console.log("👤 [L4] Seeding Student Data...");
  for (const student of TEST_STUDENTS) {
    await graph.query(`MERGE (:Student {studentId: $studentId})`, { studentId: student.studentId });

    for (const attempt of student.attempts) {
      // Create Essay Attempt
      await graph.query(`
        MATCH (s:Student {studentId: $studentId})
        MERGE (e:Essay {id: $essayId})
        SET e.tr_score = $scores.TR, e.cc_score = $scores.CC, e.lr_score = $scores.LR, e.gra_score = $scores.GRA
        MERGE (s)-[:SUBMITTED]->(e)
      `, { studentId: student.studentId, essayId: attempt.essayId, scores: attempt.score });

      // Link Errors
      for (const err of attempt.errors) {
        await graph.query(`
          MATCH (e:Essay {id: $essayId})
          MATCH (et:ErrorType {name: $typeName})
          MERGE (e)-[r:HAS_ERROR]->(et)
          SET r.count = $count
          WITH e, et
          MATCH (s:Student)-[:SUBMITTED]->(e)
          MERGE (s)-[m:MAKES_ERROR]->(et)
          SET m.count = coalesce(m.count, 0) + $count, m.lastSeen = datetime()
        `, { essayId: attempt.essayId, typeName: err.type, count: err.count });
      }

      // Link Strengths (Knowledge Points mastered)
      for (const kpId of attempt.strengths) {
        await graph.query(`
          MATCH (e:Essay {id: $essayId})
          MATCH (kp:KnowledgePoint {id: $kpId})
          MERGE (e)-[:SHOWS_STRENGTH]->(kp)
          WITH e, kp
          MATCH (s:Student)-[:SUBMITTED]->(e)
          MERGE (s)-[h:HAS_STRENGTH]->(kp)
          SET h.lastSeen = datetime()
        `, { essayId: attempt.essayId, kpId: kpId });
      }
    }
  }
  console.log("   ✔ Done.");
}

// ── 3. MAIN RUNNER ───────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Starting Ontology-First Seeding...\n");

  let graph;
  try {
    graph = await Neo4jGraph.initialize({
      url:      NEO4J_URI,
      username: NEO4J_USER,
      password: NEO4J_PASSWORD,
    });
  } catch (err) {
    console.error("❌ Neo4j Connection Failed:", err.message);
    process.exit(1);
  }

  // Clear existing
  console.log("🗑  Clearing graph...");
  await graph.query("MATCH (n) DETACH DELETE n");

  // Run layers
  await seedCorePillars(graph);
  await seedExpertKnowledge(graph);
  await seedDiagnosticModels(graph);
  await seedStudentData(graph);

  console.log("\n📊 Final Statistics:");
  const counts = await graph.query(`MATCH (n) RETURN labels(n)[0] AS label, count(n) AS count ORDER BY count DESC`);
  counts.forEach(c => console.log(`   - ${c.label}: ${c.count}`));

  console.log("\n✨ GraphRAG Ontology is ready!");
  process.exit(0);
}

main().catch(console.error);

