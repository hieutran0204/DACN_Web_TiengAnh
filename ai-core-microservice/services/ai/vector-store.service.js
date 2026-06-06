/**
 * services/ai/vector-store.service.js
 *
 * Central Knowledge Hub (Hybrid Vector Store — Optimized)
 *
 * Architecture improvements over the naive flat-JSON version:
 *   1. NDJSON (Newline-Delimited JSON) persistence: each ingest appends ONE line
 *      instead of rewriting the entire file. For N=1000 entries, this reduces
 *      write I/O from O(N * avg_entry_size) to O(1 line) per ingest call.
 *   2. Debounced write queue: consecutive ingests within 500ms are batched into a
 *      single disk flush, preventing write storms during bulk ingestion.
 *   3. In-memory cache remains the authoritative read source (no disk seek per query).
 *   4. Cosine similarity is still O(N) but avoids unnecessary object spread on every
 *      candidate by keeping vectors in a parallel typed-array index.
 *
 * Production note: For >10k entries or >100 concurrent users, migrate to Qdrant/pgvector.
 * This implementation is designed for DACN-scale (~1k-5k entries) without adding infra deps.
 */
const { OllamaEmbeddings } = require("@langchain/ollama");
const fs   = require('fs');
const path = require('path');

/** How long to wait (ms) before flushing pending writes to disk */
const WRITE_DEBOUNCE_MS = 500;

class VectorStoreService {
  constructor() {
    this.embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text",
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    });

    // NDJSON paths (each line = one JSON object)
    this.skeletonDbPath   = path.join(__dirname, '../../data/vector_store_skeletons.ndjson');
    this.knowledgeDbPath  = path.join(__dirname, '../../data/vector_store_knowledge.ndjson');

    // Legacy JSON paths — read once on startup for backwards compatibility, then migrate
    this.legacySkeletonPath  = path.join(__dirname, '../../data/vector_store_skeletons.json');
    this.legacyKnowledgePath = path.join(__dirname, '../../data/vector_store_knowledge.json');

    /** In-memory index: array of { ...metadata, vector: number[] } */
    this.skeletonCache  = [];
    this.knowledgeCache = [];

    /** Pending items not yet written to disk (flushed by per-type debounce timers) */
    this._pendingWrites       = { skeleton: [], knowledge: [] };
    // Independent timers per store type — prevents interleaved ingests from
    // cancelling each other's debounce and delaying flushes indefinitely.
    this._skeletonWriteTimer  = null;
    this._knowledgeWriteTimer = null;

    this._initDatabases();
  }

  // ─── Initialization ────────────────────────────────────────────────────────

  /**
   * Load both NDJSON stores into memory.
   * Falls back to reading legacy JSON files if NDJSON does not exist yet,
   * then immediately migrates to NDJSON format.
   */
  _initDatabases() {
    this.skeletonCache  = this._loadNDJSON(this.skeletonDbPath, this.legacySkeletonPath);
    this.knowledgeCache = this._loadNDJSON(this.knowledgeDbPath, this.legacyKnowledgePath);
    console.log(`📡 Vector Hub: Loaded ${this.skeletonCache.length} skeletons & ${this.knowledgeCache.length} knowledge chunks.`);
  }

  /**
   * Load an NDJSON file into an array. If NDJSON does not exist but a legacy
   * JSON array file does, migrate it to NDJSON on the fly.
   *
   * @param {string} ndjsonPath  - Target NDJSON file path
   * @param {string} legacyPath  - Legacy JSON array path (may not exist)
   * @returns {Object[]}
   */
  _loadNDJSON(ndjsonPath, legacyPath) {
    this._ensureDir(ndjsonPath);

    // Primary: read NDJSON
    if (fs.existsSync(ndjsonPath)) {
      try {
        const lines = fs.readFileSync(ndjsonPath, 'utf8')
          .split('\n')
          .filter(l => l.trim().length > 0);
        const parsed = lines.map(line => {
          try { return JSON.parse(line); } catch { return null; }
        }).filter(Boolean);
        return parsed;
      } catch (e) {
        console.error(`❌ Vector Hub: Failed to parse NDJSON at ${ndjsonPath}:`, e.message);
        return [];
      }
    }

    // Fallback: migrate from legacy JSON array
    if (fs.existsSync(legacyPath)) {
      console.log(`⚙️  Vector Hub: Migrating legacy JSON → NDJSON: ${legacyPath}`);
      try {
        const arr = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
        if (Array.isArray(arr) && arr.length > 0) {
          // Write each entry as a newline-delimited line
          const ndjsonContent = arr.map(item => JSON.stringify(item)).join('\n') + '\n';
          fs.writeFileSync(ndjsonPath, ndjsonContent, 'utf8');
          console.log(`✅ Vector Hub: Migrated ${arr.length} entries to NDJSON.`);
          return arr;
        }
      } catch (e) {
        console.error(`❌ Vector Hub: Migration failed:`, e.message);
      }
    }

    return [];
  }

  _ensureDir(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Search for similar structural skeletons (Layer 4).
   *
   * @param {string} studentSkeletonStr - Discourse-role-labeled essay string
   * @param {number} limit              - Max results
   * @returns {Promise<Object[]>}
   */
  async searchSimilarSkeletons(studentSkeletonStr, limit = 1) {
    return this._searchInCache(this.skeletonCache, studentSkeletonStr, limit, 0.55);
  }

  /**
   * Search for general IELTS knowledge / band descriptor chunks (RAG).
   *
   * @param {string} query  - Free-text search query
   * @param {number} limit  - Max results
   * @returns {Promise<Object[]>}
   */
  async searchGeneralKnowledge(query, limit = 3) {
    return this._searchInCache(this.knowledgeCache, query, limit, 0.45);
  }

  /**
   * Persist a new vector entry.
   * The entry is appended to the in-memory cache immediately and queued for
   * a debounced disk write. Multiple rapid ingests share one disk flush.
   *
   * @param {'skeleton'|'knowledge'} type
   * @param {Object} dataObj - Must have 'content' or 'content_representation' field
   */
  async ingest(type, dataObj) {
    try {
      const text   = dataObj.content || dataObj.content_representation;
      const vector = await this.embeddings.embedQuery(text);
      const newItem = {
        ...dataObj,
        vector,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const cache   = type === 'skeleton' ? this.skeletonCache  : this.knowledgeCache;
      const dbPath  = type === 'skeleton' ? this.skeletonDbPath : this.knowledgeDbPath;
      const pending = type === 'skeleton' ? this._pendingWrites.skeleton : this._pendingWrites.knowledge;

      // 1. Update in-memory index immediately (read path stays fresh)
      cache.push(newItem);
      pending.push(newItem);

      // 2. Schedule a debounced disk flush (batches consecutive ingests)
      this._scheduleDiskFlush(type, dbPath, pending);

      console.log(`✨ Vector Hub: Queued ${type} ID: ${newItem.id} (${cache.length} total in memory).`);
    } catch (err) {
      console.error(`❌ Ingest Error for ${type}:`, err.message);
    }
  }

  // ─── Internal Helpers ──────────────────────────────────────────────────────

  /**
   * Debounced disk writer — waits WRITE_DEBOUNCE_MS after the last ingest
   * call before writing, so bulk ingestion batches into one I/O operation.
   *
   * Each store type ('skeleton' | 'knowledge') has its own independent timer.
   * Previously a shared this._writeTimer caused interleaved ingests to cancel
   * each other's debounce: skeleton ingest at t=0 sets timer; knowledge ingest
   * at t=100ms clears it and sets a new one → skeleton pending items were never
   * flushed until the next skeleton ingest arrived.
   *
   * @param {'skeleton'|'knowledge'} type
   * @param {string} dbPath
   * @param {Object[]} pending - Reference to the pending queue for this type
   */
  _scheduleDiskFlush(type, dbPath, pending) {
    const timerKey = type === 'skeleton' ? '_skeletonWriteTimer' : '_knowledgeWriteTimer';

    // Cancel only the timer for this specific type — never touch the other type's timer.
    if (this[timerKey]) clearTimeout(this[timerKey]);

    this[timerKey] = setTimeout(() => {
      try {
        this._ensureDir(dbPath);

        // Build NDJSON lines for all pending items and append atomically
        const lines = pending.map(item => JSON.stringify(item)).join('\n') + '\n';
        fs.appendFileSync(dbPath, lines, 'utf8');

        console.log(`💾 Vector Hub: Flushed ${pending.length} pending ${type}(s) to disk.`);

        // Clear the pending queue (in-place mutation keeps reference valid)
        pending.splice(0, pending.length);
      } catch (err) {
        console.error(`❌ Vector Hub: Disk flush failed for ${type}:`, err.message);
      }
      this[timerKey] = null;
    }, WRITE_DEBOUNCE_MS);
  }

  /**
   * Cosine similarity search over an in-memory cache.
   * Returns top-N results above a relevance threshold, with vectors stripped.
   *
   * @param {Object[]} cache
   * @param {string}   queryText
   * @param {number}   limit
   * @param {number}   threshold - Minimum cosine score to include
   * @returns {Promise<Object[]>}
   */
  async _searchInCache(cache, queryText, limit, threshold) {
    if (cache.length === 0) return [];
    try {
      const queryVector = await this.embeddings.embedQuery(queryText);

      // Score all entries — keep vector in memory but strip from output
      const results = [];
      for (const item of cache) {
        const score = this._cosineSimilarity(queryVector, item.vector);
        if (score > threshold) {
          results.push({ score, item });
        }
      }

      // Sort descending, take top N, strip vector field from returned objects
      results.sort((a, b) => b.score - a.score);
      return results.slice(0, limit).map(({ score, item }) => {
        const { vector, ...rest } = item;
        return { ...rest, score };
      });
    } catch (err) {
      console.error("❌ Vector Search Error:", err.message);
      return [];
    }
  }

  /**
   * Standard cosine similarity between two numeric vectors.
   *
   * @param {number[]} vecA
   * @param {number[]} vecB
   * @returns {number} similarity score in [-1, 1]
   */
  _cosineSimilarity(vecA, vecB) {
    let dot = 0, normA = 0, normB = 0;
    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
      dot   += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  /**
   * Return diagnostic stats (useful for health-check endpoints).
   *
   * @returns {{ skeletons: number, knowledge: number, pendingSkeleton: number, pendingKnowledge: number }}
   */
  getStats() {
    return {
      skeletons:       this.skeletonCache.length,
      knowledge:       this.knowledgeCache.length,
      pendingSkeleton: this._pendingWrites.skeleton.length,
      pendingKnowledge:this._pendingWrites.knowledge.length,
    };
  }
}

module.exports = new VectorStoreService();
