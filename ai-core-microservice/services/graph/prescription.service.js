/**
 * services/graph/prescription.service.js
 *
 * Prescription Engine — converts diagnosed errors into actionable exercise recommendations.
 *
 * Fills the core gap identified in the evaluation report:
 *   The system could DIAGNOSE ("student has SVA errors 12 times")
 *   but could NOT PRESCRIBE ("practice these specific exercises to fix it").
 *
 * Architecture:
 *   1. A static in-process EXERCISE_CATALOG maps error types → exercise descriptors.
 *      This avoids a Neo4j round-trip for every recommendation query.
 *   2. `getRecommendations(errors, strengths)` returns a prioritized prescription list.
 *   3. `ensureCatalogInGraph(driver)` seeds the catalog into Neo4j as Exercise nodes
 *      with RECOMMENDED_FOR → ErrorType relationships (one-time setup call).
 *
 * IELTS Error → Exercise mapping is grounded in:
 *   - Cambridge Band Descriptors (Band 5-7 focus areas)
 *   - Common IELTS pedagogy (Swan's Practical English Usage, Murphy's Grammar in Use)
 */

const { Neo4jGraph } = require("@langchain/community/graphs/neo4j_graph");
const graphConfig = require("../../config/graph.config");

// ─── Exercise Catalog ─────────────────────────────────────────────────────────
// Each entry maps an IELTS error type (from micro-evaluator taxonomy) to a
// curated exercise descriptor. The 'resources' field is a placeholder for
// future integration with the learning content service.

const EXERCISE_CATALOG = {
  // ── Grammatical Range & Accuracy errors ──────────────────────────────────
  "SVA": {
    id: "EX_SVA_01",
    title: "Subject-Verb Agreement Drills",
    description: "Practice identifying correct verb forms for singular/plural subjects. Focus on tricky cases: collective nouns, indefinite pronouns, inverted sentences.",
    difficulty: "B2",
    estimated_minutes: 20,
    band_target: "6.0+",
    resources: ["Murphy Grammar in Use — Units 3-8", "Cambridge Academic Writing — Chapter 4"],
    tags: ["grammar", "accuracy", "GRA"]
  },
  "SUBJECT-VERB AGREEMENT": {
    id: "EX_SVA_01",
    title: "Subject-Verb Agreement Drills",
    description: "Practice identifying correct verb forms for singular/plural subjects.",
    difficulty: "B2",
    estimated_minutes: 20,
    band_target: "6.0+",
    resources: ["Murphy Grammar in Use — Units 3-8"],
    tags: ["grammar", "accuracy", "GRA"]
  },
  "TENSE": {
    id: "EX_TENSE_01",
    title: "Verb Tense Accuracy in Academic Writing",
    description: "Focus on consistent tense usage in argumentative essays. Practice: present simple for facts, present perfect for trends, past simple for examples.",
    difficulty: "B2",
    estimated_minutes: 25,
    band_target: "6.0+",
    resources: ["Murphy Grammar in Use — Units 9-14", "IELTS Academic Writing — Tense Guide"],
    tags: ["grammar", "accuracy", "GRA"]
  },
  "VERB TENSE": {
    id: "EX_TENSE_01",
    title: "Verb Tense Accuracy in Academic Writing",
    description: "Focus on consistent tense usage. Present simple for claims, present perfect for evidence.",
    difficulty: "B2",
    estimated_minutes: 25,
    band_target: "6.0+",
    resources: ["Murphy Grammar in Use — Units 9-14"],
    tags: ["grammar", "accuracy", "GRA"]
  },
  "ARTICLE": {
    id: "EX_ART_01",
    title: "Article Usage: a/an/the/zero",
    description: "Master the four article contexts: first mention (a/an), subsequent mention (the), generic statements (zero article), and unique referents (the).",
    difficulty: "B2",
    estimated_minutes: 30,
    band_target: "6.5+",
    resources: ["Swan's Practical English Usage — Articles (p. 60-72)"],
    tags: ["grammar", "accuracy", "GRA", "LR"]
  },
  "PREPOSITION": {
    id: "EX_PREP_01",
    title: "Academic Preposition Collocations",
    description: "Learn fixed academic collocations: 'have an impact on', 'contribute to', 'result in', 'responsible for'. Practice with gap-fill exercises from AWL.",
    difficulty: "B2",
    estimated_minutes: 20,
    band_target: "6.5+",
    resources: ["Oxford Collocations Dictionary", "AWL Exercises — Prepositions"],
    tags: ["grammar", "LR", "collocation"]
  },
  "FRAGMENT": {
    id: "EX_FRAG_01",
    title: "Sentence Completion: From Fragments to Full Sentences",
    description: "Identify and fix sentence fragments. Learn to distinguish: dependent clauses (need a main clause), missing-verb phrases, and correct complex sentences.",
    difficulty: "B1",
    estimated_minutes: 15,
    band_target: "5.5+",
    resources: ["Writing Skills Practice — Sentence Types"],
    tags: ["grammar", "accuracy", "GRA"]
  },
  "RUN-ON": {
    id: "EX_RUNON_01",
    title: "Punctuation & Sentence Boundary Control",
    description: "Fix run-on sentences using: (a) a full stop, (b) a semicolon, (c) a coordinating conjunction (FANBOYS), (d) a subordinating conjunction.",
    difficulty: "B2",
    estimated_minutes: 15,
    band_target: "6.0+",
    resources: ["Academic Writing — Punctuation Guide"],
    tags: ["grammar", "accuracy", "GRA"]
  },
  "WORD FORM": {
    id: "EX_WORDFORM_01",
    title: "Word Form Transformation (Noun/Verb/Adj/Adv)",
    description: "Practice derivational morphology: economy→economic→economically, benefit→beneficial→benefit (v). Essential for LR Band 7+.",
    difficulty: "B2",
    estimated_minutes: 25,
    band_target: "6.5+",
    resources: ["English Vocabulary in Use — Word Formation", "AWL Word Families"],
    tags: ["grammar", "LR", "word_form"]
  },
  "SPELLING": {
    id: "EX_SPELL_01",
    title: "Academic Spelling: Commonly Misspelled Words",
    description: "Focus on high-frequency academic words: necessary, government, environment, committee, occurrence. Learn spelling rules: -ible/-able, -tion/-sion.",
    difficulty: "B1",
    estimated_minutes: 10,
    band_target: "5.5+",
    resources: ["IELTS Vocabulary Booster — Spelling"],
    tags: ["accuracy", "LR"]
  },
  "PARALLELISM": {
    id: "EX_PARA_01",
    title: "Parallel Structure in Academic Lists",
    description: "Practice parallel structure in: lists (noun+noun+noun), comparisons (more X than Y), and correlative conjunctions (both...and, not only...but also).",
    difficulty: "B2",
    estimated_minutes: 20,
    band_target: "6.5+",
    resources: ["Academic Writing — Parallel Structure"],
    tags: ["grammar", "GRA", "accuracy"]
  },
  "PUNCTUATION": {
    id: "EX_PUNCT_01",
    title: "Academic Punctuation Mastery",
    description: "Cover: commas in complex sentences, semicolons between related clauses, colons for lists, and apostrophes.",
    difficulty: "B2",
    estimated_minutes: 15,
    band_target: "6.0+",
    resources: ["Oxford Punctuation Guide"],
    tags: ["grammar", "accuracy", "GRA"]
  },

  // ── Coherence & Cohesion errors ───────────────────────────────────────────
  "UNSUPPORTED_CLAIM": {
    id: "EX_CC_CLAIM_01",
    title: "Claim–Evidence–Example Paragraph Structure",
    description: "Learn to follow the Deductive Pattern: Topic Sentence (Claim) → Evidence/Reason → Example → Analysis → Link. Never leave a claim without support.",
    difficulty: "B2",
    estimated_minutes: 30,
    band_target: "6.5+",
    resources: ["IELTS Writing Task 2 — Paragraph Structure Guide", "Cambridge IELTS — Band 7 Model Essays"],
    tags: ["CC", "argumentation", "structure"]
  },
  "COHERENCE_JUMP": {
    id: "EX_CC_TRANS_01",
    title: "Cohesive Devices: Beyond 'However' and 'Furthermore'",
    description: "Replace mechanical transitions with implicit cohesion techniques: reference words (this, these, such), lexical repetition, summary nouns (this phenomenon, this trend).",
    difficulty: "C1",
    estimated_minutes: 25,
    band_target: "7.0+",
    resources: ["Cambridge Band 7-9 Writing Analysis", "Cohesion in English (Halliday & Hasan)"],
    tags: ["CC", "cohesion", "style"]
  },

  // ── Lexical Resource errors ───────────────────────────────────────────────
  "CLICHE": {
    id: "EX_LR_CLICHE_01",
    title: "Replacing Clichés with Sophisticated Expression",
    description: "Replace overused phrases: 'in today's society'→'in contemporary society', 'play an important role'→'be instrumental in', 'in conclusion'→Implicit closing with summary noun.",
    difficulty: "C1",
    estimated_minutes: 20,
    band_target: "7.0+",
    resources: ["IELTS Vocabulary for Band 7+ — Idiomatic Alternatives"],
    tags: ["LR", "style", "cliche"]
  },
  "LOW_AWL": {
    id: "EX_LR_AWL_01",
    title: "Academic Word List (AWL) Expansion — B2 to C1",
    description: "Study the top 10 AWL sublists. Learn words in context: 'constitute', 'demonstrate', 'facilitate', 'mitigate', 'exacerbate'. One new AWL word per day.",
    difficulty: "B2",
    estimated_minutes: 30,
    band_target: "6.5+",
    resources: ["Coxhead's Academic Word List (570 word families)", "AWL Exercises — Massey University"],
    tags: ["LR", "vocabulary", "AWL"]
  },

  // ── Task Response errors ──────────────────────────────────────────────────
  "TOPIC_DRIFT": {
    id: "EX_TR_DRIFT_01",
    title: "Task Analysis: Understanding IELTS Questions",
    description: "Learn to underline key instruction words (discuss, evaluate, to what extent) and topic words. Practice writing a direct answer in the first 2 sentences.",
    difficulty: "B2",
    estimated_minutes: 20,
    band_target: "6.0+",
    resources: ["IELTS Task 2 — Question Types Guide", "Cambridge IELTS 18 — Model Answers Analysis"],
    tags: ["TR", "task_response", "planning"]
  }
};

class PrescriptionService {
  constructor() {
    /**
     * Stores the initialization Promise (not the resolved graph).
     * Same promise-singleton pattern as MemoryService — prevents the race
     * condition where concurrent calls both enter `if (!this.graph)` before
     * the first Neo4j.initialize() resolves, creating duplicate connections.
     */
    this._initPromise = null;
    // Reverse lookup: error type → exercise descriptor
    this._errorToExercise = new Map(
      Object.entries(EXERCISE_CATALOG).map(([errType, ex]) => [errType.toUpperCase(), ex])
    );
  }

  /**
   * Returns a Promise that resolves to the initialized Neo4j graph.
   *
   * Uses promise-based singleton: the Promise itself is stored so concurrent
   * callers share a single initialization chain. Clears on failure to allow
   * the next call to retry.
   *
   * @returns {Promise<Neo4jGraph>}
   */
  _getGraph() {
    if (!this._initPromise) {
      this._initPromise = Neo4jGraph.initialize({
        url:      graphConfig.neo4j.uri,
        username: graphConfig.neo4j.username,
        password: graphConfig.neo4j.password,
        config: {
          encrypted: process.env.NEO4J_ENCRYPTED === 'true',
          trust: "TRUST_ALL_CERTIFICATES"
        }
      }).catch(err => {
        // Clear on failure so subsequent calls get a fresh attempt.
        this._initPromise = null;
        throw err;
      });
    }
    return this._initPromise;
  }

  /**
   * Generate a prioritized prescription list for a student's error profile.
   *
   * Priority logic:
   *   1. Errors with highest frequency get top priority (most impactful fix).
   *   2. If two errors have equal frequency, major errors (SVA/TENSE) rank before minor.
   *   3. Deduplicate: if multiple error types map to the same exercise, show once.
   *
   * @param {Array<{error: string, count: number}>} errors   - From getStudentMemory()
   * @param {Array<{strength: string, score: number}>} strengths - From getStudentMemory()
   * @param {number} limit - Max recommendations to return (default: 5)
   * @returns {Array<{exercise: Object, priority: number, triggered_by: string, count: number}>}
   */
  getRecommendations(errors = [], strengths = [], limit = 5) {
    const seenExerciseIds = new Set();
    const recommendations = [];

    // Sort errors by count descending (highest priority first)
    const sortedErrors = [...errors].sort((a, b) => (b.count || 0) - (a.count || 0));

    for (const { error, count } of sortedErrors) {
      const errUpper = (error || '').toUpperCase().trim();
      const exercise = this._errorToExercise.get(errUpper);

      if (!exercise) continue;
      if (seenExerciseIds.has(exercise.id)) continue;

      seenExerciseIds.add(exercise.id);
      recommendations.push({
        exercise,
        priority:     recommendations.length + 1,
        triggered_by: error,
        count:        count || 0,
        rationale_vn: `Lỗi "${error}" xuất hiện ${count} lần. ${exercise.description}`
      });

      if (recommendations.length >= limit) break;
    }

    return recommendations;
  }

  /**
   * Seed Exercise nodes and RECOMMENDED_FOR relationships into Neo4j.
   * This is idempotent (uses MERGE) — safe to call on every server start or
   * as a one-time migration script.
   *
   * Creates:
   *   (Exercise {exerciseId, title, description, difficulty, band_target, tags})
   *   -[:RECOMMENDED_FOR]->
   *   (ErrorType {name})
   *
   * @returns {Promise<{created: number, skipped: number}>}
   */
  async ensureCatalogInGraph() {
    try {
      const graph = await this._getGraph();
      let created = 0;
      let skipped = 0;

      for (const [errType, ex] of Object.entries(EXERCISE_CATALOG)) {
        try {
          await graph.query(
            `MERGE (ex:Exercise {exerciseId: $id})
             SET ex.title           = $title,
                 ex.description     = $description,
                 ex.difficulty      = $difficulty,
                 ex.band_target     = $band_target,
                 ex.estimated_minutes = $estimated_minutes,
                 ex.tags            = $tags,
                 ex.resources       = $resources,
                 ex.updatedAt       = datetime()
             WITH ex
             MERGE (et:ErrorType {name: $errType})
             MERGE (ex)-[:RECOMMENDED_FOR]->(et)`,
            {
              id:               ex.id,
              title:            ex.title,
              description:      ex.description,
              difficulty:       ex.difficulty,
              band_target:      ex.band_target,
              estimated_minutes: ex.estimated_minutes || 20,
              tags:             (ex.tags || []).join(','),
              resources:        (ex.resources || []).join(' | '),
              errType:          errType.toUpperCase()
            }
          );
          created++;
        } catch (err) {
          console.warn(`⚠️ Prescription: Failed to seed exercise for ${errType}:`, err.message);
          skipped++;
        }
      }

      console.log(`✅ Prescription Catalog seeded: ${created} exercise-error links created, ${skipped} skipped.`);
      return { created, skipped };
    } catch (err) {
      console.error("❌ Prescription: ensureCatalogInGraph failed:", err.message);
      return { created: 0, skipped: Object.keys(EXERCISE_CATALOG).length };
    }
  }

  /**
   * Query Neo4j for exercises recommended for a student's top errors.
   * Falls back to in-process catalog if Neo4j is unavailable.
   *
   * @param {string} studentId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getRecommendationsFromGraph(studentId, limit = 5) {
    try {
      const graph = await this._getGraph();

      const rows = await graph.query(
        `MATCH (s:Student {studentId: $studentId})-[r:MAKES_ERROR]->(et:ErrorType)
         MATCH (ex:Exercise)-[:RECOMMENDED_FOR]->(et)
         RETURN ex.exerciseId   AS exerciseId,
                ex.title        AS title,
                ex.description  AS description,
                ex.difficulty   AS difficulty,
                ex.band_target  AS band_target,
                ex.tags         AS tags,
                et.name         AS triggered_by,
                r.count         AS count
         ORDER BY r.count DESC, ex.difficulty DESC
         LIMIT $limit`,
        { studentId, limit }
      );

      return rows.map((row, idx) => ({
        exercise: {
          id:          row.exerciseId,
          title:       row.title,
          description: row.description,
          difficulty:  row.difficulty,
          band_target: row.band_target,
          tags:        (row.tags || '').split(',')
        },
        priority:     idx + 1,
        triggered_by: row.triggered_by,
        count:        row.count || 0,
        rationale_vn: `Lỗi "${row.triggered_by}" xuất hiện ${row.count} lần. ${row.description}`
      }));
    } catch (err) {
      console.warn("⚠️ Prescription: Graph query failed, falling back to in-process catalog:", err.message);
      return [];
    }
  }
}

module.exports = new PrescriptionService();
