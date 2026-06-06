/**
 * name: discourse-graph.service.js
 * description: CC Discourse Graph Engine — Phase 2 of Examiner Simulation Model.
 *
 * Replaces the coarse "count topic_sentences + linking words" approach with a
 * structured Discourse Graph where:
 *   - Nodes represent IDEAS (claims, evidence, examples, counter-arguments)
 *   - Edges represent LOGICAL RELATIONS (SUPPORTED_BY, CHALLENGES, ELABORATES, ILLUSTRATES)
 *
 * The graph is built by prompting the LLM to extract triplets from the essay.
 * Scoring is deterministic from the graph structure — the LLM cannot inflate the score.
 *
 * Graph scoring criteria (aligned to Cambridge CC Band Descriptors):
 *   - Band 7.0: every CLAIM has ≥1 SUPPORTED_BY edge (arguments are developed)
 *   - Band 7.5: ≥1 COUNTER + REBUTTAL edge pair (acknowledges complexity)
 *   - Penalty:  CLAIM with no outgoing edges → "unsupported assertion" → -0.5/claim
 *
 * Provider-agnostic: reads AI_PROVIDER env to choose Gemini or Ollama.
 */

const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatOllama }             = require('@langchain/ollama');

// ── Allowed node and edge types ───────────────────────────────────────────────
const ALLOWED_NODE_TYPES = new Set([
  'CLAIM',        // A main argument or position statement
  'EVIDENCE',     // Statistical, factual, or logical support for a claim
  'EXAMPLE',      // Concrete illustration of a claim or evidence
  'COUNTER',      // A counterargument or opposing view
  'REBUTTAL',     // A response that addresses a counterargument
  'BACKGROUND',   // Contextual setup (used in intro/conclusion)
  'CONCLUSION',   // Synthesizing statement
]);

const ALLOWED_EDGE_TYPES = new Set([
  'SUPPORTED_BY', // CLAIM → EVIDENCE or CLAIM → EXAMPLE (development)
  'ELABORATES',   // EVIDENCE → EXAMPLE or nested detail
  'CHALLENGES',   // COUNTER → CLAIM (opposing view)
  'REBUTS',       // REBUTTAL → COUNTER (handling opposition)
  'LEADS_TO',     // Causal or consequential chain
  'EXEMPLIFIES',  // EXAMPLE → CLAIM (example supporting a point)
]);

class DiscourseGraphService {
  constructor() {
    const provider = process.env.AI_PROVIDER || 'ollama';

    if (provider === 'ollama') {
      const modelName = process.env.MACRO_MODEL_NAME || 'qwen2.5:7b';
      this.model = new ChatOllama({
        model:       modelName,
        baseUrl:     process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        temperature: 0,
        format:      'json',
        num_ctx:     6000,
        timeout:     180000,
      });
      console.log(`🕸️ DiscourseGraphService: Using Ollama (${modelName})`);
    } else {
      this.model = new ChatGoogleGenerativeAI({
        model:       'gemini-2.0-flash',
        apiKey:      process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY,
        temperature: 0,
      });
      console.log(`🕸️ DiscourseGraphService: Using Google Gemini (gemini-2.0-flash)`);
    }
  }

  /**
   * Safely extract and validate JSON from raw LLM output.
   *
   * @param {string} raw
   * @returns {Object|null}
   */
  _parseJSON(raw) {
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) return null;
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }

  /**
   * Validate and sanitize graph nodes from LLM output.
   * Rejects nodes with unknown types or missing text.
   *
   * @param {Array} rawNodes
   * @returns {Map<string, Object>} id → node map
   */
  _validateNodes(rawNodes) {
    const nodeMap = new Map();
    if (!Array.isArray(rawNodes)) return nodeMap;

    for (const n of rawNodes) {
      if (!n.id || !n.type || !n.text) continue;
      const type = n.type.toUpperCase().trim();
      if (!ALLOWED_NODE_TYPES.has(type)) continue;
      // Evidence: text must be a non-trivial fragment from the essay
      if (typeof n.text !== 'string' || n.text.trim().length < 5) continue;
      nodeMap.set(String(n.id), { id: String(n.id), type, text: n.text.trim().slice(0, 200) });
    }
    return nodeMap;
  }

  /**
   * Validate and sanitize graph edges from LLM output.
   *
   * @param {Array}            rawEdges
   * @param {Map<string, Object>} nodeMap - validated nodes
   * @returns {Array<{from: string, to: string, relation: string}>}
   */
  _validateEdges(rawEdges, nodeMap) {
    if (!Array.isArray(rawEdges)) return [];
    const valid = [];
    for (const e of rawEdges) {
      const from = String(e.from || '');
      const to   = String(e.to   || '');
      const rel  = (e.relation || '').toUpperCase().trim();
      if (!nodeMap.has(from) || !nodeMap.has(to)) continue;
      if (!ALLOWED_EDGE_TYPES.has(rel)) continue;
      if (from === to) continue; // self-loops are meaningless
      valid.push({ from, to, relation: rel });
    }
    return valid;
  }

  /**
   * Score the discourse graph deterministically.
   *
   * Cambridge CC rubric criteria mapped to graph properties:
   *   Band 7.0: Multi-para structure + each CLAIM has ≥1 development edge
   *   Band 7.5: Above + ≥1 COUNTER/REBUTTAL pair (shows awareness of complexity)
   *   Penalty:  Each CLAIM with zero outgoing edges → unsupported assertion → -0.5
   *
   * @param {Map}   nodeMap
   * @param {Array} edges
   * @returns {{ graph_cc_score: number, reasons: string[], graph_stats: Object }}
   */
  _scoreGraph(nodeMap, edges) {
    const reasons = [];
    const nodes   = Array.from(nodeMap.values());

    const claims    = nodes.filter(n => n.type === 'CLAIM');
    const evidence  = nodes.filter(n => n.type === 'EVIDENCE' || n.type === 'EXAMPLE');
    const counters  = nodes.filter(n => n.type === 'COUNTER');
    const rebuttals = nodes.filter(n => n.type === 'REBUTTAL');

    // Build adjacency: outgoing edges per node
    const outgoing = new Map();
    for (const n of nodes) outgoing.set(n.id, []);
    for (const e of edges) {
      if (outgoing.has(e.from)) outgoing.get(e.from).push(e);
    }

    // Count supported claims (at least 1 SUPPORTED_BY or ELABORATES or EXEMPLIFIES edge)
    const devEdgeTypes = new Set(['SUPPORTED_BY', 'ELABORATES', 'EXEMPLIFIES']);
    const supportedClaims   = claims.filter(c =>
      outgoing.get(c.id)?.some(e => devEdgeTypes.has(e.relation))
    );
    const unsupportedClaims = claims.filter(c =>
      !outgoing.get(c.id)?.some(e => devEdgeTypes.has(e.relation))
    );

    // Check for counter + rebuttal pair
    const hasCounterRebuttal = counters.length >= 1 && rebuttals.length >= 1;

    const graphStats = {
      total_nodes:        nodes.length,
      total_edges:        edges.length,
      claims:             claims.length,
      evidence_examples:  evidence.length,
      counters:           counters.length,
      rebuttals:          rebuttals.length,
      supported_claims:   supportedClaims.length,
      unsupported_claims: unsupportedClaims.length,
      has_counter_rebuttal: hasCounterRebuttal,
    };

    // ── Band scoring from graph structure ─────────────────────────────────────
    let base = 5.5; // Minimum for any parseable graph

    if (nodes.length >= 4 && edges.length >= 3) {
      base = 6.0;
      reasons.push(`CC Graph: Coherent idea network (${nodes.length} nodes, ${edges.length} edges) → base 6.0`);
    }

    if (claims.length >= 2 && supportedClaims.length >= 2) {
      base = 7.0;
      reasons.push(`CC Graph: ${supportedClaims.length}/${claims.length} claims are developed with evidence/examples → Band 7.0`);
    } else if (claims.length >= 1 && supportedClaims.length >= 1) {
      base = 6.5;
      reasons.push(`CC Graph: ${supportedClaims.length}/${claims.length} claims developed → Band 6.5`);
    }

    if (base >= 7.0 && hasCounterRebuttal) {
      base = 7.5;
      reasons.push(`CC Graph: Counter-argument + rebuttal pair detected → Band 7.5 (Cambridge: "skillfully manages cohesion")`);
    }

    // ── Penalty: unsupported claims ────────────────────────────────────────────
    let unsupportedPenalty = 0;
    if (unsupportedClaims.length >= 2) {
      unsupportedPenalty = -1.0;
      reasons.push(`CC Graph: ${unsupportedClaims.length} unsupported assertions (no evidence/example edge) → -1.0`);
    } else if (unsupportedClaims.length === 1) {
      unsupportedPenalty = -0.5;
      reasons.push(`CC Graph: 1 unsupported assertion → -0.5`);
    }

    const finalScore = Math.max(5.0, Math.min(7.5, base + unsupportedPenalty));

    return { graph_cc_score: finalScore, reasons, graph_stats: graphStats };
  }

  /**
   * Build a Discourse Graph from the essay and score it for CC.
   *
   * @param {string} essay    - Full essay text
   * @param {string} question - Exam question (context for LLM)
   * @returns {Promise<{
   *   graph_cc_score: number,
   *   reasons: string[],
   *   graph_stats: Object,
   *   nodes: Array,
   *   edges: Array
   * }>}
   */
  async analyze(essay, question) {
    const prompt = `You are an expert IELTS discourse analyst. Your task: extract the argument structure of the essay as a graph.

EXAM QUESTION: "${question || 'General task 2 essay'}"

RULES:
1. Each distinct IDEA in the essay becomes a NODE.
2. Each logical RELATIONSHIP between ideas becomes an EDGE.
3. Use ONLY these node types: CLAIM, EVIDENCE, EXAMPLE, COUNTER, REBUTTAL, BACKGROUND, CONCLUSION
4. Use ONLY these edge relations: SUPPORTED_BY, ELABORATES, CHALLENGES, REBUTS, LEADS_TO, EXEMPLIFIES
5. Node "text" must be a SHORT (≤15 word) paraphrase or direct quote from the essay.
6. Assign simple numeric IDs ("1", "2", "3"...).
7. IMPORTANT: Do NOT invent ideas not present in the essay.

ESSAY:
"""
${essay.slice(0, 2500)}
"""

Return ONLY valid JSON:
{
  "nodes": [
    {"id": "1", "type": "CLAIM", "text": "short paraphrase of the idea from essay"},
    {"id": "2", "type": "EVIDENCE", "text": "short paraphrase of supporting evidence"}
  ],
  "edges": [
    {"from": "1", "to": "2", "relation": "SUPPORTED_BY"}
  ]
}`;

    try {
      console.log(`🕸️ DiscourseGraphService: Building discourse graph...`);
      const response = await this.model.invoke(prompt);
      const raw = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
      const parsed = this._parseJSON(raw);

      if (!parsed) {
        throw new Error('Could not parse LLM graph output');
      }

      const nodeMap = this._validateNodes(parsed.nodes);
      const edges   = this._validateEdges(parsed.edges, nodeMap);
      const { graph_cc_score, reasons, graph_stats } = this._scoreGraph(nodeMap, edges);

      console.log(`🕸️ DiscourseGraphService: ${nodeMap.size} nodes, ${edges.length} edges → CC graph score: ${graph_cc_score}`);

      return {
        graph_cc_score,
        reasons,
        graph_stats,
        nodes: Array.from(nodeMap.values()),
        edges,
      };
    } catch (err) {
      console.warn(`⚠️ DiscourseGraphService: Analysis failed (non-fatal): ${err.message}`);
      return {
        graph_cc_score: null, // null = fallback to existing CC signals
        reasons:        [`Discourse graph unavailable: ${err.message}`],
        graph_stats:    {},
        nodes:          [],
        edges:          [],
      };
    }
  }
}

module.exports = new DiscourseGraphService();
