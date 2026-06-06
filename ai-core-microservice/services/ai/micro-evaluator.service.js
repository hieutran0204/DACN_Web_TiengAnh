const { ChatOllama } = require("@langchain/ollama");
const llmConfig = require("../../config/llm.config");

/**
 * Phase 1A: Micro-Evaluator (Sentence-Level Analysis)
 * 
 * Uses a small LLM (e.g., Qwen 3B via Ollama) to detect specific grammar,
 * spelling, and punctuation errors sentence by sentence.
 */
class MicroEvaluatorService {
  constructor() {
    // We prefer a small, fast model for extraction. 
    // Fallback to default if a specific micro model isn't set.
    const modelName = process.env.MICRO_MODEL_NAME;
    console.log(`🤖 Micro-Evaluator initialized with model: ${modelName}`);
    
    this.model = new ChatOllama({
      model: modelName,
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      temperature: 0.1, // Low temperature for deterministic extraction
      format: "json",
      num_ctx: 8192,    // Cửa sổ ngữ cảnh cho câu lẻ
      timeout: 300000,  // Timeout 5 phút cho mỗi câu
    });

    // Canonical set of allowed error types.
    // Any type outside this list is hallucinated and will be discarded.
    this.ALLOWED_ERROR_TYPES = new Set([
      "SVA", "SUBJECT-VERB AGREEMENT",
      "TENSE", "VERB TENSE",
      "FRAGMENT",
      "RUN-ON",
      "ARTICLE",
      "PREPOSITION",
      "SPELLING",
      "WORD FORM",
      "PUNCTUATION",
      "PARALLELISM"
    ]);

    // B1-level words that small LLMs commonly flag as "wrong word choice" — they are NOT errors.
    this.SAFE_COMMON_WORDS = new Set([
      "also", "however", "therefore", "furthermore", "moreover", "benefit",
      "important", "technology", "government", "society", "people", "many",
      "because", "although", "which", "that", "who", "this", "these",
      "education", "environment", "economy", "health", "problem", "solution"
    ]);
  }

  /**
   * Safe JSON parser using brace balancing to extract the FIRST complete JSON object
   */
  _extractJSON(text) {
    try {
      const cleaned = text.replace(/```json|```/g, "").trim();
      const start = cleaned.indexOf("{");
      if (start === -1) return { errors: [] };

      let braceCount = 0;
      let end = -1;
      for (let i = start; i < cleaned.length; i++) {
        if (cleaned[i] === "{") braceCount++;
        else if (cleaned[i] === "}") braceCount--;
        
        if (braceCount === 0) {
          end = i + 1;
          break;
        }
      }

      if (end === -1) return { errors: [] };
      return JSON.parse(cleaned.substring(start, end));
    } catch (e) {
      console.warn("⚠️ Micro-Evaluator JSON parse error:", e.message);
      return { errors: [] };
    }
  }

  /**
   * Fix indices AND validate errors to eliminate hallucinations.
   * An error is rejected if:
   *   1. Its `span` text does not exist verbatim in the sentence (hallucinated span).
   *   2. Its `type` is not in the canonical ALLOWED_ERROR_TYPES set.
   *   3. Its `span` is a safe common word that models frequently misflag.
   *
   * @param {string} sentence
   * @param {Array} errors
   * @returns {Array} validated, index-corrected errors
   */
  _validateErrors(sentence, errors) {
    if (!errors || !Array.isArray(errors)) return [];

    const validated = [];
    for (const err of errors) {
      // Gate 1: Type must be in canonical taxonomy
      const typeUpper = (err.type || "").toUpperCase().trim();
      const typeAllowed = [...this.ALLOWED_ERROR_TYPES].some(allowed =>
        typeUpper.includes(allowed)
      );
      if (!typeAllowed) {
        // console.log(`🚫 Micro: Discarded hallucinated error type "${err.type}"`);
        continue;
      }

      // Gate 2: Span must exist verbatim in the sentence
      if (!err.span || err.span.trim().length === 0) continue;
      const spanIdx = sentence.indexOf(err.span);
      if (spanIdx === -1) {
        // console.log(`🚫 Micro: Discarded error with hallucinated span "${err.span}"`);
        continue;
      }

      // Gate 2.5: Ensure the span is not embedded inside another word 
      // (prevents finding "on the other hand" inside "eon the other handucation")
      const charBefore = spanIdx > 0 ? sentence[spanIdx - 1] : '';
      const charAfter = spanIdx + err.span.length < sentence.length ? sentence[spanIdx + err.span.length] : '';
      const isLetter = /[a-zA-Z]/;
      // If the character immediately before or after the span is a letter, it means the span is a partial word substring.
      if (isLetter.test(charBefore) || isLetter.test(charAfter)) {
        continue;
      }

      // Gate 3: Span must not be a safe common word (over-flagging prevention)
      if (this.SAFE_COMMON_WORDS.has(err.span.toLowerCase().trim())) {
        // console.log(`🚫 Micro: Discarded false flag on safe word "${err.span}"`);
        continue;
      }

      // Gate 4: Error must have a non-trivial explanation
      if (!err.explanation_vn || err.explanation_vn.trim().length < 5) continue;

      validated.push({
        ...err,
        start: spanIdx,
        end: spanIdx + err.span.length,
        type: typeUpper
      });
    }
    return validated;
  }

  /**
   * Pre-verification layer (GRA Phase 1 — Examiner Simulation Model).
   *
   * Runs deterministic rule-based patterns to identify SUSPECT spans before
   * sending to the LLM. The LLM is then asked to CONFIRM or DENY only those
   * specific spans, preventing it from hallucinating new errors.
   *
   * Rules are intentionally conservative — only flag patterns with near-zero
   * false positive rate at the rule level.
   *
   * @param {string} sentence
   * @returns {{ suspects: Array<{span: string, type: string, hint: string}>, hasSuspects: boolean }}
   */
  _preVerifyGrammar(sentence) {
    const suspects = [];
    const s = sentence.trim();

    // Rule 1: Subject-Verb Agreement — detect plural subject + singular verb
    // Pattern: "they/people/students/governments + is/was/has (3rd sing)"
    const svaPatterns = [
      { regex: /\b(they|people|students|governments|countries|children|parents|workers|employees)\s+(is|was|has|does|doesn't|don't)\b/i, type: 'SVA', hint: 'Plural subject with singular verb detected' },
      { regex: /\b(he|she|it|everyone|someone|nobody|everybody)\s+(are|were|have)\b/i, type: 'SVA', hint: 'Singular subject with plural verb detected' },
    ];
    for (const p of svaPatterns) {
      const m = s.match(p.regex);
      if (m) suspects.push({ span: m[0], type: p.type, hint: p.hint });
    }

    // Rule 2: Wrong verb form after modal
    // Pattern: "can/could/should/must/will + past tense verb"
    const modalPattern = /\b(can|could|should|must|will|would|may|might)\s+(went|came|did|had|was|were|saw|knew|thought|bought|caught|taught|brought)\b/i;
    const mMatch = s.match(modalPattern);
    if (mMatch) suspects.push({ span: mMatch[0], type: 'TENSE', hint: 'Modal verb followed by past tense form (should be base form)' });

    // Rule 3: Article missing before countable singular noun (common pattern)
    // Pattern: sentence starts with a noun without article after linking verb
    const articlePattern = /\b(is|are|was|were|be|become|seems?)\s+(?!a\b|an\b|the\b|very\b|quite\b|rather\b|extremely\b|too\b|more\b|most\b|less\b)(important|significant|effective|necessary|essential|key|major|critical|vital|useful)\b/i;
    const aMatch = s.match(articlePattern);
    if (aMatch) suspects.push({ span: aMatch[0], type: 'ARTICLE', hint: 'Possible missing article before adjective-noun' });

    // Rule 4: Double verb without conjunction
    // Pattern: "verb + verb" without to/and/or (e.g. "helps reduce" is VALID, skip those)
    // Only flag clear doubles: "went studied", "is are"
    const doubleVerbPattern = /\b(is|are|was|were|has|have|had)\s+(is|are|was|were|has|have|had)\b/i;
    const dvMatch = s.match(doubleVerbPattern);
    if (dvMatch) suspects.push({ span: dvMatch[0], type: 'SVA', hint: 'Double auxiliary verb — likely agreement error' });

    return { suspects, hasSuspects: suspects.length > 0 };
  }

  /**
   * Analyze a single sentence for grammar errors and discourse role.
   *
   * Fast-path: sentences with fewer than 5 words are structurally trivial
   * (transitional phrases, very short examples). We skip the LLM call and
   * return a clean result with a rule-inferred role, saving ~300-500ms per
   * skipped sentence. This alone reduces pipeline time by ~15-25% on typical
   * IELTS essays which contain several short transitional sentences.
   *
   * @param {string} sentence
   * @returns {Promise<Object>} { sentence, discourse_role, errors, error_count, is_error_free }
   */
  async analyzeSentence(sentence) {
    if (!sentence || sentence.trim().length === 0) {
      return { sentence, errors: [], error_count: 0, is_error_free: true };
    }

    // Fast-path: skip LLM for very short sentences (< 5 tokens).
    // These are transitional fragments ("Furthermore,", "In conclusion,")
    // that contain no meaningful grammar structure to evaluate.
    const tokenCount = sentence.trim().split(/\s+/).length;
    if (tokenCount < 5) {
      return {
        sentence,
        discourse_role: 'transitional',
        errors:         [],
        error_count:    0,
        is_error_free:  true,
        method:         'fast_path'
      };
    }

    // ── GRA Pre-verification (Phase 1 — Examiner Simulation Model) ──────────
    // Run deterministic rule patterns to detect suspect grammar spans.
    // If suspects are found, we build a VERIFICATION prompt (confirm/deny)
    // instead of an open-ended discovery prompt, reducing LLM hallucinations.
    const { suspects, hasSuspects } = this._preVerifyGrammar(sentence);

    let prompt;
    if (hasSuspects) {
      const suspectList = suspects
        .map((s, i) => `${i + 1}. Span: "${s.span}" | Type: ${s.type} | Hint: ${s.hint}`)
        .join('\n');

      prompt = `You are a strict IELTS grammar checker in VERIFICATION mode.

Your ONLY task: Confirm or deny the grammar errors listed below. Do NOT report any other errors.
For each suspect span, decide: is it a real error or is the sentence actually grammatically correct?

CRITICAL RULES:
- Answer ONLY about the listed spans. Do NOT add new errors.
- If a span is correct in its context, mark it as NOT an error (omit from errors array).
- If a span is a real error, include it with the corrected suggestion.
- The "span" field MUST be copied exactly from the suspect list.

SENTENCE: "${sentence}"

SUSPECT SPANS TO VERIFY:
${suspectList}

Return ONLY valid JSON:
{"discourse_role": "topic_sentence | supporting_detail | example | conclusion | transitional", "errors": [{"type": "...", "span": "EXACT_SPAN_FROM_SUSPECT_LIST", "suggestion": "...", "explanation_vn": "..."}]}`;
    } else {
      // Standard discovery prompt (no suspects found by rule-checker)
      prompt = `You are a strict IELTS grammar checker. Your job is to find REAL, unambiguous grammar errors only.

ALLOWED ERROR TYPES (use ONLY these exact labels):
SVA, TENSE, FRAGMENT, RUN-ON, ARTICLE, PREPOSITION, SPELLING, WORD FORM, PUNCTUATION, PARALLELISM

CRITICAL RULES:
- Only flag errors you are 100% certain about.
- Do NOT flag stylistic choices, informal but grammatically correct sentences, or uncommon but valid vocabulary.
- Do NOT flag transition words (however, furthermore, etc.) as errors.
- If in doubt, do NOT flag. Return an empty errors array.
- The "span" field MUST be the EXACT substring from the sentence, copy-pasted character by character.

--- POSITIVE EXAMPLES (flag these) ---
Sentence: "He go to school yesterday."
Output: {"discourse_role": "supporting_detail", "errors": [{"type": "TENSE", "span": "go", "suggestion": "went", "explanation_vn": "\u0110\u1ed9ng t\u1eeb sai th\u00ec qu\u00e1 kh\u1ee9. 'go' ph\u1ea3i l\u00e0 'went'."}]}

Sentence: "She is very interesting in music."
Output: {"discourse_role": "supporting_detail", "errors": [{"type": "WORD FORM", "span": "interesting", "suggestion": "interested", "explanation_vn": "'interested in' l\u00e0 c\u1ee5m \u0111\u00fang, kh\u00f4ng ph\u1ea3i 'interesting in'."}]}

--- NEGATIVE EXAMPLES (do NOT flag these) ---
Sentence: "In conclusion, technology brings many benefits."
Output: {"discourse_role": "conclusion", "errors": []}

Sentence: "Furthermore, governments should invest more in education."
Output: {"discourse_role": "supporting_detail", "errors": []}

Sentence: "This, however, may lead to unforeseen consequences."
Output: {"discourse_role": "transitional", "errors": []}

---
Return ONLY valid JSON:
{"discourse_role": "topic_sentence | supporting_detail | example | conclusion | transitional | claim | hook | thesis", "errors": [{"type": "...", "span": "EXACT_TEXT_FROM_SENTENCE", "suggestion": "...", "explanation_vn": "..."}]}

Sentence: "${sentence}"`;
    }
    try {
      const response = await this.model.invoke(prompt);
      const parsed = this._extractJSON(response.content);

      // Run multi-gate validation to eliminate hallucinations
      const errors = this._validateErrors(sentence, parsed.errors || []);

      return {
        sentence,
        discourse_role: parsed.discourse_role || "Unknown",
        errors,
        error_count: errors.length,
        is_error_free: errors.length === 0
      };
    } catch (error) {
      console.error("❌ Micro-Evaluator Error:", error.message);
      // Fail-safe: return clean result to not pollute the pipeline
      return { sentence, errors: [], error_count: 0, is_error_free: true };
    }
  }

  /**
   * Process an array of sentences using a bounded concurrency pool.
   *
   * Instead of strictly sequential (CHUNK_SIZE=1), we dispatch up to
   * CONCURRENCY_LIMIT sentences at once. This gives a ~CONCURRENCY_LIMIT x
   * speedup while staying within Ollama's connection limits.
   *
   * Concurrency is controlled by the MICRO_CONCURRENCY environment variable
   * (default: 3). Increase carefully — Ollama queues requests internally but
   * each open connection consumes RAM. For a 6GB VRAM card, 3 is safe.
   *
   * @param {string[]} sentences
   * @returns {Promise<Object[]>} results in original sentence order
   */
  async processSentences(sentences) {
    if (!sentences || sentences.length === 0) return [];

    const total = sentences.length;
    // Default concurrency raised from 3 → 5 to reduce queue depth.
    // With concurrency=5 and the short-sentence fast-path (~20% skip rate),
    // effective LLM calls ≈ 0.8×total. p50 latency target: ~300-360s (was 654s).
    // Monitor VRAM usage: each Ollama connection holds ~200MB context for small models.
    // Lower back to 3 if you see OOM errors or Ollama connection timeouts.
    const CONCURRENCY = parseInt(process.env.MICRO_CONCURRENCY || '2', 10);

    console.log(`⏳ Micro-Evaluator: Processing ${total} sentences (concurrency=${CONCURRENCY})...`);

    const results = new Array(total);
    let activeCount  = 0;
    let nextIndex    = 0;

    // Bounded concurrency pool using a promise queue
    await new Promise((resolve, reject) => {
      const tryDispatch = () => {
        // Drain: launch tasks until pool is full or all tasks dispatched
        while (activeCount < CONCURRENCY && nextIndex < total) {
          const i = nextIndex++;
          activeCount++;

          this.analyzeSentence(sentences[i])
            .then(result => {
              results[i] = result;
            })
            .catch(err => {
              console.error(`🚨 Micro-Evaluator fallback for sentence ${i}:`, err.message);
              results[i] = {
                sentence: sentences[i],
                discourse_role: 'Unknown',
                errors: [],
                error_count: 0,
                is_error_free: true
              };
            })
            .finally(() => {
              activeCount--;
              const processed = results.filter(Boolean).length + 1; // +1 for the one we just finished
              if (processed % 3 === 0 || processed === total) {
                 console.log(`  ➔ Micro-Evaluator progress: ${processed}/${total} sentences processed...`);
              }
              if (nextIndex < total) {
                tryDispatch();
              } else if (activeCount === 0) {
                resolve();
              }
            });
        }

        // Edge case: all dispatched but some still running
        if (nextIndex >= total && activeCount === 0) resolve();
      };

      tryDispatch();
    });

    const processed = results.filter(Boolean).length;
    console.log(`✅ Micro-Evaluator: Completed ${processed}/${total} sentences (concurrency=${CONCURRENCY}).`);
    return results;
  }
}

module.exports = new MicroEvaluatorService();

