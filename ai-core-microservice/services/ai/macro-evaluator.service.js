/**
 * services/ai/macro-evaluator.service.js
 *
 * Node 2 — LLM Feedback Generator (Dual-Node Architecture)
 *
 * Responsibilities (narrowed from the previous implementation):
 *   - Invoke the LLM with the simplified feedback-only prompt.
 *   - Parse and sanitize the LLM JSON response.
 *   - OVERRIDE band_breakdown and overall_band with lockedScores (bulletproof).
 *   - Polish scaffolding feedback.
 *
 * What this service NO LONGER does:
 *   - Does NOT compute or determine band scores (→ ScoringEngine, Node 1).
 *   - Does NOT enforce Hard Caps (→ applied before this call, in ScoringEngine).
 *   - Does NOT run a mega-prompt with 20 scoring rules.
 *
 * The final override at the end guarantees that even if the LLM somehow
 * outputs different numbers in its JSON, the locked scores from Node 1
 * always win. This is the safety net.
 */

const { ChatOllama }       = require('@langchain/ollama');
const llmConfig            = require('../../config/llm.config');
const { buildFeedbackPrompt } = require('./prompt.service');

// Known B1/basic words that LLMs hallucinate as C1 advanced vocabulary.
// Kept here as a defensive sanitization layer even though the new prompt
// constraints (CONFIRMED ADVANCED WORDS) make this less necessary.
const BASIC_WORDS = new Set([
  'benefit', 'problem', 'solution', 'important', 'technology', 'government',
  'society', 'education', 'environment', 'economy', 'health', 'people',
  'major', 'role', 'factor', 'function', 'source', 'income', 'labor',
  'growth', 'development', 'impact', 'effect', 'advantage', 'disadvantage',
  'issue', 'challenge', 'opportunity', 'change', 'increase', 'decrease'
]);

class FeedbackGeneratorService {

  constructor() {
    const modelName = process.env.MACRO_MODEL_NAME || llmConfig.model;
    this.model = new ChatOllama({
      model:       modelName,
      baseUrl:     process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
      temperature: 0.3,    // Low temperature → consistent, rule-following output
      num_ctx:     8192,   // Reduced from 16384: simplified prompt is much shorter
      timeout:     6000000 // 100-minute timeout for slow local GPUs
    });
    console.log(`🤖 Node 2 Feedback Generator initialized with model: ${modelName}`);
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Generate pedagogical feedback for a student essay.
   *
   * Scores must be LOCKED by ScoringEngine (Node 1) before calling this.
   * The lockedScores object is injected into the prompt and enforced as a
   * final override on the returned result — LLM cannot change them.
   *
   * @param {string} essay         - Original essay text
   * @param {string} question      - Exam question / task prompt
   * @param {string} type          - Essay type (e.g. 'opinion', 'ielts-task2')
   * @param {string} ragContext    - Student history + knowledge base context
   * @param {Object} lockedScores  - Output from ScoringEngine.computeScores()
   * @param {Array}  annotations   - Sentence-level error annotations from FeatureBuilder
   * @param {Object} featureMap    - Full feature map for sanitization context
   * @returns {Promise<Object>} Feedback object with locked band scores
   */
  async generate(essay, question, type, ragContext, lockedScores, annotations, featureMap) {
    const prompt = buildFeedbackPrompt(
      essay, question, type, ragContext, lockedScores, annotations, featureMap
    );

    let result;

    try {
      console.log('🤖 Node 2: Requesting feedback from LLM (scores already locked)...');
      const response = await this.model.invoke(prompt);

      try {
        // Extract JSON from response (guard against LLM emitting extra text)
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        result = JSON.parse(jsonMatch ? jsonMatch[0] : response.content);

        // Capture token usage metadata for monitoring
        if (response.response_metadata) {
          result.usage = {
            prompt_tokens:     response.response_metadata.prompt_eval_count || 0,
            completion_tokens: response.response_metadata.eval_count        || 0
          };
        } else if (response.usage_metadata) {
          result.usage = {
            prompt_tokens:     response.usage_metadata.input_tokens  || 0,
            completion_tokens: response.usage_metadata.output_tokens || 0
          };
        }
      } catch (parseErr) {
        console.error('❌ Node 2: Failed to parse LLM JSON response.');
        return this._getFailureResult('Invalid AI JSON response format.');
      }

      // ── Sanitize LLM output (defensive layer) ──────────────────────────
      this._validateAndSanitize(result, essay, featureMap);
      this._polishFeedback(result, featureMap);

    } catch (err) {
      console.error('❌ Node 2 Feedback Generator Error:', err.message);
      throw err;
    }

    // ── FINAL OVERRIDE: Enforce locked scores — bulletproof guarantee ─────
    // Even if the LLM somehow outputs different numbers in the JSON body,
    // the ScoringEngine's deterministic values always win here.
    result.band_breakdown = { ...lockedScores.band_breakdown };
    result.overall_band   = lockedScores.overall_band;

    // Recalculate overall with the locked breakdown as an explicit audit step
    const { task_response: tr, coherence_cohesion: cc, lexical_resource: lr, grammatical_range_accuracy: gra } = result.band_breakdown;
    const avg      = (tr + cc + lr + gra) / 4;
    const intPart  = Math.floor(avg);
    const fraction = avg - intPart;
    result.overall_band =
      fraction >= 0.75 ? intPart + 1.0 :
      fraction >= 0.25 ? intPart + 0.5 :
      intPart + 0.0;

    console.log(`✅ Node 2: Feedback generated. Final overall: ${result.overall_band}`);
    return result;
  }

  // ── Private Helpers ─────────────────────────────────────────────────────────

  /**
   * Post-processing sanitizer: removes hallucinated vocabulary and non-existent
   * error entries from the LLM output.
   *
   * Even with the new constrained prompt, this runs as a defensive final layer.
   * It removes:
   *   - advanced_vocabulary entries that are B1/basic words
   *   - advanced_vocabulary entries not in the confirmed list from FeatureBuilder
   *   - detailed_errors entries whose sentence text does not appear in the essay
   *
   * @param {Object} result
   * @param {string} essay
   * @param {Object} featureMap
   */
  _validateAndSanitize(result, essay, featureMap) {
    const essayLower = (essay || '').toLowerCase();

    const confirmedAdvancedWords = new Set(
      (featureMap?.lexical_resource?.advanced_words || []).map(w => w.toLowerCase())
    );

    // Sanitize advanced_vocabulary
    if (Array.isArray(result.advanced_vocabulary)) {
      const before = result.advanced_vocabulary.length;
      result.advanced_vocabulary = result.advanced_vocabulary.filter(entry => {
        const word = (entry.word || '').toLowerCase().trim();
        if (BASIC_WORDS.has(word)) {
          console.log(`🧹 Sanitize: Removed hallucinated advanced vocab "${word}" (B1 basic word)`);
          return false;
        }
        if (confirmedAdvancedWords.size > 0 && !confirmedAdvancedWords.has(word)) {
          console.log(`🧹 Sanitize: Removed unconfirmed vocab "${word}" (not in B2+ confirmed list)`);
          return false;
        }
        return true;
      });
      if (result.advanced_vocabulary.length < before) {
        console.log(`🧹 Sanitize: advanced_vocabulary ${before} → ${result.advanced_vocabulary.length} entries.`);
      }
    }

    // Sanitize detailed_errors: remove entries whose sentence is not in the essay
    if (Array.isArray(result.detailed_errors)) {
      const before = result.detailed_errors.length;
      result.detailed_errors = result.detailed_errors.filter(entry => {
        if (!entry.sentence) return false;
        const fragment = entry.sentence.slice(0, 40).toLowerCase();
        if (!essayLower.includes(fragment)) {
          console.log(`🧹 Sanitize: Removed hallucinated error sentence: "${entry.sentence.slice(0, 50)}..."`);
          return false;
        }
        return true;
      });
      if (result.detailed_errors.length < before) {
        console.log(`🧹 Sanitize: detailed_errors ${before} → ${result.detailed_errors.length} entries.`);
      }
    }
  }

  /**
   * Polish scaffolding feedback to ensure Graph Engine issues surface in
   * the scaffolding_suggestions section.
   *
   * @param {Object} result
   * @param {Object} featureMap
   */
  _polishFeedback(result, featureMap) {
    const logicIssues = featureMap?.cohesion?.coherence_issues || [];
    if (logicIssues.length > 0 && !result.scaffolding_suggestions_vn) {
      result.scaffolding_suggestions_vn = 'Hệ thống phát hiện mạch lập luận đang gặp vấn đề. Hãy chú ý đến cấu trúc Claim → Evidence → Example.';
    }
  }

  /**
   * Return a structured failure result when the LLM call or JSON parse fails.
   *
   * @param {string} reason
   * @returns {Object}
   */
  _getFailureResult(reason) {
    return {
      overall_band:   0,
      band_breakdown: { task_response: 0, coherence_cohesion: 0, lexical_resource: 0, grammatical_range_accuracy: 0 },
      feedback_vn:    `Lỗi hệ thống: ${reason}`,
      error:          true
    };
  }
}

module.exports = new FeedbackGeneratorService();
