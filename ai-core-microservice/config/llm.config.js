/**
 * config/llm.config.js
 * 
 * Centralized LLM configuration.
 * 
 * PROVIDERS:
 * - "ollama": Local/Cloud Ollama endpoint (primary — privacy-first, zero API cost)
 * - "gemini": Google's official API (fallback — requires GEMINI_API_KEY)
 * 
 * Default is always "ollama" to prevent accidental cloud API usage during benchmarks.
 */

module.exports = {
  // Provider: "gemini" or "ollama" — controlled by AI_PROVIDER env var
  provider: process.env.AI_PROVIDER || "ollama",

  // Model Name:
  // If ollama: "gpt-oss:20b-cloud", "qwen3:8b", etc.
  // If gemini: "gemini-2.5-flash", "gemini-2.0-flash", etc.
  model: process.env.AI_MODEL || "gpt-oss:20b-cloud",

  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  responseMimeType: "application/json", // Only for Gemini
};
