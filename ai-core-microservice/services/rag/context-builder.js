/**
 * services/rag/context-builder.js
 *
 * 🧩 GraphRAG Core: Combines GRAPH memory + VECTOR knowledge into
 * a single, structured context string that is injected into the LLM prompt.
 *
 * Input:
 *   - graphData: { errors: [{error, count}], strengths: [{strength, score}] }
 *   - vectorData: [{ text, score }] (from vector DB, mocked for now)
 *
 * Output: A formatted string ready for prompt injection
 */

const graphConfig = require("../../config/graph.config");

/**
 * Build rich context from graph memory + vector knowledge
 */
function buildContext(graphData = {}, vectorData = []) {
  const { errors = [], strengths = [], hasHistory = false } = graphData;
  const { recurringThreshold } = graphConfig.retrieval;

  const lines = [];

  // ─── GRAPH CONTEXT (Student Memory) ────────────────────────────────
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

  // ─── VECTOR CONTEXT (Knowledge Base) ───────────────────────────────
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
 * Parse LLM result JSON and extract triplets for graph update
 */
function extractTripletsFromResult(llmResult = {}) {
  const triplets = [];

  // Extract from grammar_errors_found
  const grammarErrors = llmResult.grammar_errors_found || [];
  for (const ge of grammarErrors) {
    if (ge.error && ge.type) {
      triplets.push({
        subject: { label: "ErrorType", name: ge.type.toLowerCase().trim() },
        relationship: "LEADS_TO",
        object:  { label: "ErrorType", name: ge.error.toLowerCase().trim() },
      });
    }
  }

  // Extract from weaknesses
  const weaknesses = llmResult.weaknesses || [];
  for (const w of weaknesses) {
    if (w) {
      triplets.push({
        subject: { label: "Essay",     name: "current_essay" },
        relationship: "HAS_ERROR",
        object:  { label: "ErrorType", name: w.toLowerCase().trim() },
      });
    }
  }

  // Extract from strengths
  const strengthList = llmResult.strengths || [];
  for (const s of strengthList) {
    if (s) {
      triplets.push({
        subject: { label: "Essay",    name: "current_essay" },
        relationship: "HAS_STRENGTH",
        object:  { label: "Strength", name: s.toLowerCase().trim() },
      });
    }
  }

  return triplets;
}

module.exports = { buildContext, extractTripletsFromResult };
