/**
 * config/llm.config.js
 * 
 * Centralized LLM configuration.
 * 
 * PROVIDERS: 
 * - "gemini": Google's official API
 * - "ollama": Local/Cloud Ollama endpoint (DeepSeek, Qwen, etc.)
 */

module.exports = {
  // Provider: "gemini" or "ollama"
  provider: process.env.AI_PROVIDER || "ollama", 

  // Model Name:
  // If gemini: "gemini-1.5-flash", "gemini-1.5-pro", etc.
  // If ollama: "gpt-oss:20b-cloud", "qwen3:8b", etc.
  model: process.env.AI_MODEL || "gpt-oss:20b-cloud",

  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  responseMimeType: "application/json", // Only for Gemini
};
