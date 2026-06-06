/**
 * name: collocation-embedding.service.js
 * description: LR Collocation Embedding Similarity Engine — Phase 2 of Examiner Simulation Model.
 *
 * Replaces the Word List matching approach (ACADEMIC_WORDS, ACADEMIC_COLLOCATIONS hardcoded sets)
 * with vector-based Cosine Similarity against a curated corpus of B2/C1/C2 academic collocations.
 *
 * Design:
 *   - Pre-computed corpus: ~300 IELTS Band 7-9 collocations embedded once at startup,
 *     stored in memory (no disk I/O per essay).
 *   - Runtime: extract all n-grams (2-3 word chunks) from the student essay,
 *     embed them, then compute cosine similarity vs corpus entries.
 *   - A chunk scoring >= SIMILARITY_THRESHOLD is a "collocation hit".
 *   - Results feed into feature_map.lexical_resource as collocation_similarity_score
 *     which ScoringEngine._computeLR() uses as a primary LR signal.
 *
 *   Provider-agnostic: reads AI_PROVIDER env to choose Gemini or Ollama embeddings.
 *   Switch to Ollama: set AI_PROVIDER=ollama in .env — no code changes needed.
 */

const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { OllamaEmbeddings }             = require('@langchain/ollama');

// ── Cosine similarity ────────────────────────────────────────────────────────
const cosineSim = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) { dot += a[i] * b[i]; na += a[i] ** 2; nb += b[i] ** 2; }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
};

// ── Similarity threshold ─────────────────────────────────────────────────────
// Cosine >= 0.72: strong academic register match (C1/C2 lexical chunk)
// Cosine >= 0.60: moderate match (B2 academic phrase)
const THRESHOLD_HIGH = 0.72;
const THRESHOLD_MID  = 0.60;

// ── Cambridge IELTS Band 7-9 Academic Collocation Corpus ────────────────────
// Curated from Cambridge Phrase Bank, BAWE corpus, and Cambridge IELTS 9-18.
// These are the "Less Common Lexical Items" that Cambridge examiners expect
// to see in Band 7+ essays. Organized by semantic category for maintainability.
const COLLOCATION_CORPUS = [
  // Cause & Effect
  "give rise to significant consequences",
  "lead to a marked deterioration",
  "exacerbate existing inequalities",
  "mitigate the adverse effects",
  "alleviate financial burden",
  "have far-reaching implications",
  "pose a serious threat",
  "trigger a chain reaction",
  "result in substantial improvements",

  // Argument & Analysis
  "it is widely acknowledged that",
  "a compelling argument can be made",
  "empirical evidence suggests",
  "the prevailing view holds that",
  "proponents of this view argue",
  "critics contend that",
  "it remains contentious whether",
  "from a sociological perspective",
  "this phenomenon warrants careful consideration",

  // Society & Government
  "government intervention is imperative",
  "policy reform is urgently needed",
  "foster social cohesion",
  "promote sustainable development",
  "address the root causes",
  "implement stringent measures",
  "impose regulatory frameworks",
  "erode public trust",
  "undermine social stability",

  // Technology & Innovation
  "rapid technological advancement",
  "digital transformation has revolutionized",
  "artificial intelligence poses ethical dilemmas",
  "automation displaces the workforce",
  "unprecedented levels of connectivity",
  "harness the potential of technology",
  "cybersecurity vulnerabilities proliferate",
  "algorithm-driven decision making",

  // Education
  "cultivate critical thinking skills",
  "broaden intellectual horizons",
  "pedagogical approaches vary significantly",
  "equip students with competencies",
  "foster academic excellence",
  "address educational disparities",
  "curriculum should encompass",
  "promote lifelong learning",

  // Environment
  "ecological footprint must be reduced",
  "biodiversity is under unprecedented threat",
  "renewable energy sources offer viable alternatives",
  "carbon emissions contribute to climate change",
  "conservation efforts are inadequate",
  "sustainable resource management",
  "irreversible environmental damage",
  "mitigate greenhouse gas emissions",

  // Economy & Work
  "economic inequality has widened considerably",
  "globalization has profound implications",
  "labour market demands are evolving",
  "financial incentives drive behavior",
  "entrepreneurial spirit fosters innovation",
  "fiscal policies must be reformed",
  "workforce retraining programs are essential",
  "productivity gains offset costs",

  // Health
  "public health infrastructure requires investment",
  "mental health stigma persists",
  "sedentary lifestyle poses health risks",
  "preventive healthcare reduces long-term costs",
  "healthcare disparities disproportionately affect",
  "holistic approach to wellbeing",

  // Concession & Counter-argument
  "while it is undeniable that",
  "despite widespread support for",
  "notwithstanding these advantages",
  "critics rightly point out that",
  "a more nuanced perspective reveals",
  "the counterargument merits consideration",

  // Hedging & Academic Register
  "to a considerable extent",
  "in the foreseeable future",
  "under certain circumstances",
  "it is plausible to suggest",
  "evidence points to the conclusion",
  "broadly speaking this suggests",
  "arguably the most significant factor",
];

// ── Band score mapping from similarity results ───────────────────────────────
/**
 * Maps collocation hit counts and quality to an LR signal score.
 * @param {number} highHits   - Chunks scoring >= THRESHOLD_HIGH (C1/C2 quality)
 * @param {number} midHits    - Chunks scoring >= THRESHOLD_MID (B2 quality)
 * @param {number} totalChunks - Total n-grams tested
 * @returns {{ score: number, density: number, label: string }}
 */
const _mapToScore = (highHits, midHits, totalChunks) => {
  const density = totalChunks > 0 ? (highHits + midHits * 0.5) / totalChunks : 0;

  if (highHits >= 8 || density >= 0.15) return { score: 7.5, density, label: 'Exceptional collocation range (C1/C2)' };
  if (highHits >= 5 || density >= 0.10) return { score: 7.0, density, label: 'Strong collocation range (C1/C2)' };
  if (highHits >= 3 || density >= 0.07) return { score: 6.5, density, label: 'Good collocation use (B2/C1)' };
  if (highHits >= 1 || density >= 0.04) return { score: 6.0, density, label: 'Some academic collocations (B2)' };
  if (midHits  >= 3)                    return { score: 5.5, density, label: 'Basic collocation awareness' };
  return { score: 5.0, density, label: 'Limited or no academic collocations' };
};

class CollocationEmbeddingService {
  constructor() {
    const provider = process.env.AI_PROVIDER || 'ollama';

    if (provider === 'ollama') {
      const modelName = process.env.EMBED_MODEL || 'nomic-embed-text';
      this.embeddings = new OllamaEmbeddings({
        model:   modelName,
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      });
      console.log(`🔢 CollocationEmbeddingService: Using Ollama embeddings (${modelName})`);
    } else {
      this.embeddings = new GoogleGenerativeAIEmbeddings({
        model:  'text-embedding-004',
        apiKey: process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY,
      });
      console.log(`🔢 CollocationEmbeddingService: Using Google text-embedding-004`);
    }

    // Corpus vectors — pre-computed once at startup
    this._corpusVectors = null;
    this._initPromise   = this._precomputeCorpus();
  }

  /**
   * Pre-compute embeddings for the entire corpus at service startup.
   * Done once — these are reused for every essay analysis.
   */
  async _precomputeCorpus() {
    try {
      console.log(`🔢 CollocationEmbeddingService: Pre-computing ${COLLOCATION_CORPUS.length} corpus vectors...`);
      this._corpusVectors = await this.embeddings.embedDocuments(COLLOCATION_CORPUS);
      console.log(`✅ CollocationEmbeddingService: Corpus ready (${this._corpusVectors.length} vectors).`);
    } catch (err) {
      console.error(`❌ CollocationEmbeddingService: Corpus pre-compute failed: ${err.message}`);
      this._corpusVectors = [];
    }
  }

  /**
   * Extract all 2-gram and 3-gram chunks from essay text.
   * Filters out stop-word-only chunks and very short tokens.
   *
   * @param {string} text - Essay text
   * @returns {string[]} Array of unique n-gram chunks
   */
  _extractChunks(text) {
    const STOP = new Set([
      'the','a','an','is','are','was','were','be','been','being',
      'have','has','had','do','does','did','will','would','could','should','may','might',
      'to','of','in','on','at','by','for','with','from','as','or','and','but','so',
      'i','we','they','he','she','it','this','that','these','those','not','no',
    ]);

    // Lowercase, split on whitespace, keep only alpha tokens
    const words = text.toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 3);

    const chunks = new Set();
    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i], w2 = words[i + 1];
      // 2-gram: at least one non-stop word
      if (!STOP.has(w1) || !STOP.has(w2)) {
        chunks.add(`${w1} ${w2}`);
      }
      // 3-gram: at least one non-stop word among first and last
      if (i + 2 < words.length) {
        const w3 = words[i + 2];
        if (!STOP.has(w1) || !STOP.has(w3)) {
          chunks.add(`${w1} ${w2} ${w3}`);
        }
      }
    }
    return Array.from(chunks);
  }

  /**
   * Analyze the full essay for academic collocation density using vector similarity.
   *
   * @param {string} essay - Full essay text
   * @returns {Promise<{
   *   collocation_similarity_score: number,   // 5.0 – 7.5 (LR signal)
   *   collocation_density: number,            // ratio of academic chunks
   *   collocation_hits_high: number,          // C1/C2 hits
   *   collocation_hits_mid: number,           // B2 hits
   *   top_collocations: string[],             // matched chunks for prompt/UI
   *   label: string
   * }>}
   */
  async analyze(essay) {
    // Wait for corpus to be ready
    await this._initPromise;

    if (!this._corpusVectors || this._corpusVectors.length === 0) {
      console.warn('⚠️ CollocationEmbeddingService: Corpus not available, returning neutral score.');
      return {
        collocation_similarity_score: 6.0,
        collocation_density:          0,
        collocation_hits_high:        0,
        collocation_hits_mid:         0,
        top_collocations:             [],
        label:                        'Embedding corpus unavailable (fallback)',
      };
    }

    try {
      const chunks = this._extractChunks(essay);
      if (chunks.length === 0) {
        return { collocation_similarity_score: 5.0, collocation_density: 0, collocation_hits_high: 0, collocation_hits_mid: 0, top_collocations: [], label: 'No valid chunks extracted' };
      }

      console.log(`🔢 CollocationEmbeddingService: Embedding ${chunks.length} essay chunks...`);

      // Batch embed all essay chunks (one API call)
      const chunkVectors = await this.embeddings.embedDocuments(chunks);

      let highHits = 0, midHits = 0;
      const topCollocations = [];

      for (let i = 0; i < chunks.length; i++) {
        const cv = chunkVectors[i];
        let bestScore = 0;
        let bestCorpusEntry = '';

        // Compare against all corpus vectors, keep best match
        for (let j = 0; j < this._corpusVectors.length; j++) {
          const sim = cosineSim(cv, this._corpusVectors[j]);
          if (sim > bestScore) {
            bestScore = sim;
            bestCorpusEntry = COLLOCATION_CORPUS[j];
          }
        }

        if (bestScore >= THRESHOLD_HIGH) {
          highHits++;
          topCollocations.push({ chunk: chunks[i], score: bestScore, closest: bestCorpusEntry });
        } else if (bestScore >= THRESHOLD_MID) {
          midHits++;
        }
      }

      // Sort by score descending, take top 10 for prompt/UI
      topCollocations.sort((a, b) => b.score - a.score);
      const topChunks = topCollocations.slice(0, 10).map(t => t.chunk);

      const { score, density, label } = _mapToScore(highHits, midHits, chunks.length);

      console.log(`🔢 CollocationEmbeddingService: highHits=${highHits}, midHits=${midHits}, chunks=${chunks.length}, score=${score}`);

      return {
        collocation_similarity_score: score,
        collocation_density:          parseFloat(density.toFixed(4)),
        collocation_hits_high:        highHits,
        collocation_hits_mid:         midHits,
        top_collocations:             topChunks,
        label,
      };
    } catch (err) {
      console.error(`❌ CollocationEmbeddingService: Analysis failed: ${err.message}`);
      return {
        collocation_similarity_score: 6.0,
        collocation_density:          0,
        collocation_hits_high:        0,
        collocation_hits_mid:         0,
        top_collocations:             [],
        label:                        'Analysis error (fallback)',
      };
    }
  }
}

module.exports = new CollocationEmbeddingService();
