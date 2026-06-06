/**
 * services/rag/context-builder.js
 *
 * GraphRAG Core: Combines GRAPH memory + VECTOR knowledge into
 * a single, structured context string injected into the LLM prompt.
 *
 * Input:
 *   - graphData: { errors: [{error, count}], strengths: [{strength, score}] }
 *   - vectorData: [{ text, score }]
 *
 * Output: A formatted string ready for prompt injection
 */

const graphConfig = require("../../config/graph.config");

// ─── Canonical ErrorType Taxonomy ─────────────────────────────────────────────
// Maps free-text LLM weakness phrases → canonical ErrorType node names.
// Prevents graph pollution from hundreds of near-duplicate nodes like
// "overuse of transitions", "too many transition words", "mechanical transitions" etc.
// Add new entries as new patterns emerge from production data.
const WEAKNESS_NORMALIZATION_MAP = [
  { pattern: /subject.verb|sva|agreement/i,               canonical: "subject_verb_agreement" },
  { pattern: /article|determiner/i,                       canonical: "article_usage" },
  { pattern: /tense|verb form|verb tense/i,               canonical: "tense_consistency" },
  { pattern: /run.on|comma splice/i,                      canonical: "run_on_sentence" },
  { pattern: /fragment|incomplete sentence/i,              canonical: "sentence_fragment" },
  { pattern: /preposition/i,                               canonical: "preposition_error" },
  { pattern: /collocation/i,                               canonical: "collocation_error" },
  { pattern: /transition|linking word|cohesive device/i,  canonical: "overuse_of_transitions" },
  { pattern: /clich[eé]|template|formulaic/i,             canonical: "cliche_usage" },
  { pattern: /repetiti/i,                                  canonical: "word_repetition" },
  { pattern: /topic sentence|no clear claim/i,            canonical: "weak_topic_sentence" },
  { pattern: /support|evidence|example|elaborat/i,        canonical: "insufficient_support" },
  { pattern: /word.?count|too short/i,                    canonical: "insufficient_word_count" },
  { pattern: /vocabulary|lexical|word choice|word range/i, canonical: "limited_vocabulary" },
  { pattern: /spelling/i,                                  canonical: "spelling_error" },
  { pattern: /punctuation/i,                               canonical: "punctuation_error" },
  { pattern: /passive voice/i,                             canonical: "passive_voice_overuse" },
  { pattern: /coherence|logic|flow|jump/i,                canonical: "coherence_issue" },
  { pattern: /task response|off.?topic|drift/i,           canonical: "task_response_weakness" },
];

// LLM error_type values from prompt schema → canonical ErrorType node names
const ERROR_TYPE_MAP = {
  GRAMMATICAL: "grammatical_error",
  STYLISTIC:   "stylistic_error",
  LEXICAL:     "lexical_error",
  COHERENCE:   "coherence_error",
};

/**
 * Normalize a free-text weakness string into a canonical ErrorType name.
 * Falls back to a slugified version of the original string if no pattern matches.
 *
 * @param {string} text
 * @returns {string} canonical snake_case error type name
 */
function _normalizeWeakness(text) {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();
  for (const { pattern, canonical } of WEAKNESS_NORMALIZATION_MAP) {
    if (pattern.test(trimmed)) return canonical;
  }
  // Fallback: slugify (max 50 chars to prevent excessively long node names)
  return trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 50) || null;
}

// ─── Public Functions ──────────────────────────────────────────────────────────

/**
 * Build rich context string from graph memory + vector knowledge for LLM prompt injection.
 *
 * @param {{ errors: Array, strengths: Array, hasHistory: boolean }} graphData
 * @param {Array<{ text: string, score: number }>} vectorData
 * @returns {string}
 */
function buildContext(graphData = {}, vectorData = []) {
  const { errors = [], strengths = [], hasHistory = false } = graphData;
  const { recurringThreshold } = graphConfig.retrieval;

  const lines = [];

  // ─── GRAPH CONTEXT (Student Memory) ────────────────────────────────────────
  if (hasHistory) {
    lines.push("=== STUDENT HISTORY (from Knowledge Graph) ===");

    if (errors.length > 0) {
      lines.push("\n📌 Recurring Errors (prioritize correcting these):");
      for (const e of errors) {
        const isRecurring = (e.count || 0) >= recurringThreshold;
        const tag = isRecurring ? " ⚠️ RECURRING" : "";
        lines.push(`  - ${e.error} (seen ${e.count} time(s))${tag}`);
      }
    }

    if (strengths.length > 0) {
      lines.push("\n✅ Known Strengths (acknowledge these, build upon them):");
      for (const s of strengths) {
        lines.push(`  - ${s.strength} (confidence: ${(s.score || 0).toFixed(1)})`);
      }
    }

    lines.push(""); // blank line separator
  } else {
    lines.push("=== STUDENT HISTORY ===");
    lines.push("  No previous submissions found. Treat as a new student.");
    lines.push("");
  }

  // ─── VECTOR CONTEXT (Knowledge Base) ───────────────────────────────────────
  if (vectorData.length > 0) {
    lines.push("=== RELEVANT IELTS KNOWLEDGE (from Knowledge Base) ===");
    for (const v of vectorData) {
      lines.push(`  - ${v.text}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Parse LLM result JSON and extract knowledge triplets for graph update.
 *
 * Sources (in priority order):
 *   1. detailed_errors  — richest structured source; has error_type, severity, sentence_index.
 *                         Produces: (Student)-[:HAS_ERROR {severity}]->(ErrorType)
 *   2. grammar_errors_found — string array, normalized via WEAKNESS_NORMALIZATION_MAP.
 *                         Produces: (Student)-[:HAS_ERROR]->(ErrorType)
 *   3. weaknesses       — free-text strings, normalized before storage.
 *                         Produces: (Essay)-[:HAS_ERROR]->(ErrorType)
 *   4. strengths        — free-text strings stored as-is.
 *                         Produces: (Essay)-[:HAS_STRENGTH]->(Strength)
 *
 * Bug fixes vs previous version:
 *   - grammar_errors_found is string[], not object[]. Old code checked ge.error && ge.type
 *     (object properties on a string) → always false → zero triplets extracted.
 *   - detailed_errors was completely ignored — now used as the primary signal.
 *   - weaknesses were stored as raw LLM strings → graph had hundreds of unique
 *     near-duplicate nodes. Now normalized via canonical taxonomy.
 *
 * @param {Object} llmResult - Parsed JSON from MacroEvaluatorService
 * @returns {Array<{ subject, relationship, object, properties? }>}
 */
function extractTripletsFromResult(llmResult = {}) {
  const triplets  = [];
  const seenTypes = new Set(); // Dedup canonical error types within one submission

  // ── SOURCE 1: detailed_errors (primary — richest structure) ────────────────
  // Schema from prompt.service.js JSON_TEMPLATE:
  //   { sentence_index, sentence, error_type, severity, description_vn, suggestion_vn }
  const detailedErrors = llmResult.detailed_errors || [];
  for (const de of detailedErrors) {
    if (!de || typeof de !== "object") continue;

    const rawType    = (de.error_type || "").toUpperCase();
    const canonical  = ERROR_TYPE_MAP[rawType] || rawType.toLowerCase() || "unknown_error";
    const severity   = (de.severity || "LOW").toUpperCase();

    if (!seenTypes.has(canonical)) {
      seenTypes.add(canonical);
    }

    triplets.push({
      subject:      { label: "Essay",     name: "current_essay" },
      relationship: "HAS_ERROR",
      object:       { label: "ErrorType", name: canonical },
      properties:   { severity, sentence_index: de.sentence_index ?? -1 },
    });
  }

  // ── SOURCE 2: grammar_errors_found (string[] — fallback signal) ────────────
  // These are plain strings like "Subject-verb agreement error in paragraph 2."
  // Old code checked ge.error && ge.type — always false on strings. Fixed below.
  const grammarErrors = llmResult.grammar_errors_found || [];
  for (const ge of grammarErrors) {
    if (!ge || typeof ge !== "string") continue;

    const canonical = _normalizeWeakness(ge);
    if (!canonical || seenTypes.has(canonical)) continue; // skip duplicates from detailed_errors
    seenTypes.add(canonical);

    triplets.push({
      subject:      { label: "Essay",     name: "current_essay" },
      relationship: "HAS_ERROR",
      object:       { label: "ErrorType", name: canonical },
    });
  }

  // ── SOURCE 3: weaknesses (free-text — normalized before graph storage) ──────
  // Store canonical form to prevent graph pollution from near-duplicate nodes.
  const weaknesses = llmResult.weaknesses || [];
  for (const w of weaknesses) {
    if (!w || typeof w !== "string") continue;

    const canonical = _normalizeWeakness(w);
    if (!canonical || seenTypes.has(canonical)) continue;
    seenTypes.add(canonical);

    triplets.push({
      subject:      { label: "Essay",     name: "current_essay" },
      relationship: "HAS_ERROR",
      object:       { label: "ErrorType", name: canonical },
    });
  }

  // ── SOURCE 4: strengths (kept as-is — no normalization needed) ────────────
  const strengthList = llmResult.strengths || [];
  for (const s of strengthList) {
    if (!s || typeof s !== "string") continue;
    triplets.push({
      subject:      { label: "Essay",    name: "current_essay" },
      relationship: "HAS_STRENGTH",
      object:       { label: "Strength", name: s.toLowerCase().trim().slice(0, 80) },
    });
  }

  return triplets;
}

module.exports = { buildContext, extractTripletsFromResult };

