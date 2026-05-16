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
    const modelName = process.env.MICRO_MODEL_NAME || "gpt-oss:20b-cloud";
    console.log(`🤖 Micro-Evaluator initialized with model: ${modelName}`);
    
    this.model = new ChatOllama({
      model: modelName,
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      temperature: 0.1, // Low temperature for deterministic extraction
      format: "json",
    });
  }

  /**
   * Safe JSON parser
   */
  _extractJSON(text) {
    try {
      const cleaned = text.replace(/```json|```/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}") + 1;
      if (start === -1 || end === 0) return { errors: [] };
      return JSON.parse(cleaned.substring(start, end));
    } catch (e) {
      console.warn("⚠️ Micro-Evaluator JSON parse error:", e.message);
      return { errors: [] };
    }
  }

  /**
   * Ensure indices match the actual string using the span to avoid LLM hallucination
   */
  _fixIndices(sentence, errors) {
    if (!errors || !Array.isArray(errors)) return [];
    
    return errors.map(err => {
      if (err.span) {
        const start = sentence.indexOf(err.span);
        if (start !== -1) {
          err.start = start;
          err.end = start + err.span.length;
        } else {
          // If the model hallucinated the span text, invalidate indices
          err.start = -1;
          err.end = -1;
        }
      }
      return err;
    }).filter(err => err.start !== -1); // Remove errors with hallucinated spans
  }

  /**
   * Analyze a single sentence
   * @param {string} sentence 
   * @returns {Object} 
   */
  async analyzeSentence(sentence) {
    if (!sentence || sentence.trim().length === 0) {
      return { sentence, errors: [], error_count: 0, is_error_free: true };
    }

    const prompt = `Analyze the following English sentence for grammar, spelling, and punctuation errors.

--- GUIDELINES ---
1. **Precision**: Only flag objective, indisputable grammatical, spelling, and punctuation errors. Do NOT invent errors.
2. **Tolerance**: Be highly tolerant of valid hyphenated words, alternative spellings (UK/US), and advanced/creative word choices. If a word is uncommon but technically correct in an academic context, DO NOT flag it as an error.
3. **Academic Terms**: Recognize neo-logisms and specialized academic terms (e.g., 'infobesity', 'counterculture', 'cyberbullying') as valid lexical items.
4. **Stylistic Choices**: Do not penalize stylistic choices. If a sentence is grammatically correct but could be phrased "better", DO NOT flag it as an error here. The goal is error detection, not stylistic rewriting.
--- END GUIDELINES ---

You must return a JSON object exactly matching this schema:
{
  "errors": [
    {
      "type": "Error Type (e.g., SVA, Article, Tense, Preposition)",
      "span": "The exact wrong word or phrase from the sentence",
      "confidence": 0.9,
      "severity": "major",
      "suggestion": "Corrected word/phrase",
      "explanation_vn": "Giải thích ngắn gọn bằng tiếng Việt lý do tại sao sai"
    }
  ]
}
If there are no errors, return: { "errors": [] }

Sentence: "${sentence}"`;

    try {
      const response = await this.model.invoke(prompt);
      const parsed = this._extractJSON(response.content);
      
      let errors = parsed.errors || [];
      errors = this._fixIndices(sentence, errors);
      
      return {
        sentence,
        errors,
        error_count: errors.length,
        is_error_free: errors.length === 0
      };
    } catch (error) {
      console.error("❌ Micro-Evaluator Error:", error.message);
      // Fallback on error to not block the pipeline
      return { sentence, errors: [], error_count: 0, is_error_free: true };
    }
  }

  /**
   * Process an array of sentences using CONCURRENT CHUNKING (Speed + High Accuracy)
   * Sends multiple single-sentence requests at the same time.
   * @param {string[]} sentences 
   * @returns {Promise<Object[]>}
   */
  async processSentences(sentences) {
    if (!sentences || sentences.length === 0) return [];
    
    const results = [];
    const total = sentences.length;
    // CONCURRENCY LIMIT: 5 câu cùng lúc (Tăng tốc gấp 5 lần nhưng không làm sập server/API)
    const CHUNK_SIZE = 5; 

    console.log(`⏳ Đang soi lỗi ${total} câu (Chế độ Concurrent ${CHUNK_SIZE} luồng)...`);

    for (let i = 0; i < total; i += CHUNK_SIZE) {
      const chunk = sentences.slice(i, i + CHUNK_SIZE);
      console.log(`🚀 Xử lý luồng song song từ câu ${i + 1} đến ${Math.min(i + CHUNK_SIZE, total)}...`);
      
      // Chạy song song tất cả các câu trong Chunk này
      const chunkPromises = chunk.map(sentence => this.analyzeSentence(sentence));
      const chunkResults = await Promise.all(chunkPromises);
      
      results.push(...chunkResults);
    }

    console.log(`✅ Đã quét xong toàn bộ ${total} câu bằng Concurrent Mode.`);
    return results;
  }
}

module.exports = new MicroEvaluatorService();
