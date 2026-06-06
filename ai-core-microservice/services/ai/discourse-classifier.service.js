/**
 * services/ai/discourse-classifier.service.js
 *
 * Rule-based discourse role fallback classifier.
 *
 * NOTE: The original 3-layer architecture (Ollama → Local Model → Rule-based) has been
 * collapsed to rule-based only. The Ollama layer is now integrated directly into
 * MicroEvaluatorService.processSentences(), which returns discourse_role per sentence.
 * Only _fallbackToRules() remains active — called from writing.service.js when the
 * Micro-LLM returns "Unknown" for a sentence role.
 *
 * Dead code removed: classify(), _saveToDataset().
 * Reason: classify() called microEvaluator.analyzeSentence() which duplicated the
 * processSentences() pool, and _saveToDataset() used synchronous fs.appendFileSync
 * in an async hot path (Node.js event loop anti-pattern).
 */

class DiscourseClassifierService {

  /**
   * Heuristic fallback based on discourse markers and sentence position.
   * Applied when the Micro-LLM returns "Unknown" as the discourse role.
   *
   * @param {string}   sentence
   * @param {string[]} markers       - Discourse markers extracted by Python NLP
   * @param {number}   index         - Sentence index (0-based) within the essay
   * @returns {{ role: string, errors: [], confidence: number, method: string }}
   */
  _fallbackToRules(sentence, markers, index) {
    const text = sentence.toLowerCase();
    const cleanMarkers = (markers || []).map(m => m.toLowerCase());
    
    let role = "supporting_detail";

    if (cleanMarkers.some(m => ["however", "but", "nevertheless", "on the other hand"].includes(m))) {
      role = "transitional";
    } else if (cleanMarkers.some(m => ["for example", "for instance", "specifically", "such as"].includes(m))) {
      role = "example";
    } else if (cleanMarkers.some(m => ["therefore", "consequently", "thus", "in conclusion", "to sum up"].includes(m))) {
      role = "conclusion";
    } else if (index === 0) {
      role = "topic_sentence";
    }

    return {
      role,
      errors:     [],
      confidence: 0.5,
      method:     'RULE_BASED'
    };
  }
}

module.exports = new DiscourseClassifierService();
