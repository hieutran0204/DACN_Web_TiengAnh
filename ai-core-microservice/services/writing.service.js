/**
 * services/writing.service.js
 *
 * ✅ GraphRAG Writing Pipeline (Hybrid Micro-Macro Architecture)
 *
 * Flow:
 *   1. 🧱 Pre-processing: Split essay into sentences & paragraphs.
 *   2. 🔍 Phase 1A: Micro-Evaluator detects specific errors per sentence.
 *   3. 🧩 Phase 1B: Rule-Based classifies structure, linking words, academic words, fragments.
 *   4. 📊 Phase 1.5: Feature Builder aggregates into normalized metrics & annotations.
 *   5. 🛑 Phase 2.5: Band Constraint Engine calculates Hard Caps.
 *   6. 🔵 Vector & Graph retrieval.
 *   7. 💉 Prompt injection  — inject Feature Map, Annotations, and Hard Caps.
 *   8. 🤖 LLM call          — Gemini/DeepSeek scores the essay (Justify with evidence).
 *   9. 🧮 IELTS Math Fix    — Overrides Overall Score with strict rounding rules.
 *   10. 🔺 Triplet extract  — parse new errors for graph update.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ChatOllama } = require("@langchain/ollama");
const llmConfig = require("../config/llm.config");
const memoryService = require("./graph/memory.service");
const vectorService = require("./rag/vector.service");
const { buildContext, extractTripletsFromResult } = require("./rag/context-builder");
const { buildWritingPrompt } = require("./ai/prompt.service");


const microEvaluator = require("./ai/micro-evaluator.service");
const ruleBased = require("./nlp/rule-based.service");
const featureBuilder = require("./rag/feature-builder");
const constraintEngine = require("./ai/band-constraint.engine");

// ─── LLM Client Factory ──────────────────────────────────────────────────────
let model;

if (llmConfig.provider === "ollama") {
  console.log(`🤖 Sử dụng Ollama Model: ${llmConfig.model}`);
  model = new ChatOllama({
    model: llmConfig.model,
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    temperature: llmConfig.temperature,
    format: "json",
  });
} else {
  console.log(`🤖 Sử dụng Gemini Model: ${llmConfig.model}`);
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  model = genAI.getGenerativeModel({
    model: llmConfig.model,
    generationConfig: {
      responseMimeType: llmConfig.responseMimeType,
      temperature: llmConfig.temperature,
      topP: llmConfig.topP,
      topK: llmConfig.topK,
    },
  });
}

// ─── JSON Parser ─────────────────────────────────────────────────────────────
const extractJSON = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end   = cleaned.lastIndexOf("}") + 1;
    if (start === -1 || end === 0) throw new Error("No JSON found");
    return JSON.parse(cleaned.substring(start, end));
  } catch (e) {
    console.error("❌ JSON parse error:", text.substring(0, 800));
    return { error: "AI returned invalid JSON", raw: text.substring(0, 1000) };
  }
};

/**
 * Standard IELTS Rounding Rule
 * Ex: 5.25 -> 5.5, 5.75 -> 6.0, 5.125 -> 5.0
 */
const calculateIELTSOverall = (tr, cc, lr, gra) => {
  const average = (tr + cc + lr + gra) / 4;
  const intPart = Math.floor(average);
  const fraction = average - intPart;

  if (fraction >= 0.75) return intPart + 1.0;
  if (fraction >= 0.25) return intPart + 0.5;
  return intPart + 0.0;
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main GraphRAG essay analysis pipeline
 */
const analyzeWriting = async (
  essay,
  question  = "",
  type      = "ielts-task2",
  studentId = null,
  essayId   = null
) => {

  // ── 1. 🧱 Pre-processing ──────────────────────────────────────────────────
  const sentences = ruleBased.splitSentences(essay);
  console.log(`🧱 Split essay into ${sentences.length} sentences.`);

  // ── 2. 🔍 Phase 1A & 1B: Micro & Rule-Based Analysis ──────────────────────
  console.log("🔍 Running Micro-Evaluator and Rule-Based extraction...");
  // NGẮT TỪNG CÂU ĐỂ ĐÁNH GIÁ (Phục hồi theo ý bạn)
  const microResults = await microEvaluator.processSentences(sentences);
  const ruleResults = sentences.map((sent, idx) => ruleBased.analyzeSentence(sent, idx));

  // ── 3. 📊 Phase 1.5: Feature Builder ──────────────────────────────────────
  const { feature_map, annotations } = featureBuilder.buildFeatures(microResults, ruleResults, essay, ruleBased);
  console.log("📊 Feature Map generated:", JSON.stringify(feature_map.grammar.dominant_error_types));

  // ── 4. 🛑 Phase 2.5: Constraint Engine ────────────────────────────────────
  const hardCaps = constraintEngine.calculateCaps(feature_map);
  console.log("🛑 Hard Caps:", JSON.stringify(hardCaps));

  // ── 5. 🔵 Vector & Graph Retrieval ────────────────────────────────────────
  let vectorContext = [];
  try {
    const dominantErrors = feature_map.grammar.dominant_error_types.join(" ");
    const searchQuery = `${type} IELTS Writing Band Descriptors. How to fix: ${dominantErrors}`;
    vectorContext = await vectorService.search(searchQuery);
    console.log(`🔵 Vector: ${vectorContext.length} chunks retrieved based on dominant errors.`);
  } catch (err) {
    console.warn("⚠️ Vector retrieval failed (non-fatal):", err.message);
  }

  let graphContext = { errors: [], strengths: [], hasHistory: false };
  if (studentId) {
    try {
      graphContext = await memoryService.getStudentMemory(studentId);
      console.log(`🟣 Graph: retrieved for student ${studentId}`);
    } catch (err) {
      console.warn("⚠️ Graph retrieval failed (non-fatal):", err.message);
    }
  }

  // ── 6. 🧩 Context & Prompt Injection ──────────────────────────────────────
  const ragContext = buildContext(graphContext, vectorContext);
  const prompt = buildWritingPrompt(essay, question, type, ragContext, feature_map, annotations, hardCaps);
  
  console.log("--- DEBUG: PROMPT SENT TO AI (Macro) ---");
  console.log(prompt.substring(0, 1000) + "...");
  console.log("-------------------------------");

  // ── 7. 🤖 LLM Call (Final Judge) ──────────────────────────────────────────
  let result;
  try {
    console.log(`🤖 Gọi ${llmConfig.provider} (${llmConfig.model}) để chấm điểm...`);
    let rawText;
    if (llmConfig.provider === "ollama") {
      const response = await model.invoke(prompt);
      rawText = response.content;
    } else {
      const llmResult = await model.generateContent(prompt);
      rawText = await llmResult.response.text();
    }
    
    console.log("✅ AI (Macro) đã phản hồi!");
    result = extractJSON(rawText);
  } catch (err) {
    console.error("❌ LLM Error:", err.message);
    throw err; 
  }

  if (result.error) return result;

  // ── 8. 🩹 Post-Processing: Integrate with UI Format ──────────────────────
  result.annotated_text = annotations;
  result.feature_map    = feature_map;
  result.hard_caps_applied = hardCaps;


  // ── 8. 🧮 IELTS Math Fix (Overriding LLM's Math) ────────────────────────
  if (result.band_breakdown) {
    const tr = result.band_breakdown.task_response || 0;
    const cc = result.band_breakdown.coherence_cohesion || 0;
    const lr = result.band_breakdown.lexical_resource || 0;
    const gra = result.band_breakdown.grammatical_range_accuracy || 0;
    
    // Auto calculate EXACT overall band using strict IELTS rules
    result.overall_band = calculateIELTSOverall(tr, cc, lr, gra);
    result.math_debug = { raw_average: (tr + cc + lr + gra) / 4, rounded_band: result.overall_band };
  }

  // Annotate result
  result.generated_at   = new Date().toISOString();
  result.type           = type;
  result.graphrag_used  = !!studentId;   
  
  result.feature_map    = feature_map;
  // result.annotated_text is already set in step 8
  result.hard_caps_applied = hardCaps;

  result.rag_debug_info = {
    knowledge_base_chunks: vectorContext.map(v => ({ text: v.text, score: v.score })),
    student_memory: graphContext.hasHistory ? {
        past_errors: graphContext.errors.map(e => e.error),
        past_strengths: graphContext.strengths.map(s => s.strength)
    } : null
  };

  // ── 9. 🔺 Triplet Extraction & Graph Update ──────────────────────────────
  if (studentId && essayId) {
    const triplets = extractTripletsFromResult(result);
    triplets.originalText = essay; // Đính kèm nội dung để lưu vào Neo4j
    console.log(`🔺 Extracted ${triplets.length} triplets from LLM result`);

    memoryService.updateStudentMemory(studentId, essayId, triplets).catch(err =>
      console.error("❌ Async graph update failed:", err.message)
    );
  }

  return result;
};

module.exports = { analyzeWriting };
