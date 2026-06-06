/**
 * scripts/run-eval.js
 *
 * name: Evaluation Runner
 * description: Automated benchmark runner for GraphRAG AI Tutor evaluation.
 *   Measures: Error Detection Rate, Retrieval Recall/Precision (semantic),
 *   Hard Negative Filter, Recommendation Relevance, and Failure Taxonomy.
 *   Supports ablation testing (vector-only, graph-only, hybrid).
 *
 * Usage:
 *   node scripts/run-eval.js                    # Full hybrid evaluation
 *   node scripts/run-eval.js --mode vector      # Ablation: vector-only
 *   node scripts/run-eval.js --mode graph       # Ablation: graph-only
 *   node scripts/run-eval.js --limit 5          # Only run first 5 cases
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');

const writingService = require('../services/writing.service');
const { OllamaEmbeddings } = require('@langchain/ollama');

// ─── Constants ───────────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '../data/eval');
const RESULTS_PATH = path.join(DATA_DIR, 'eval_results.json');
const SIMILARITY_THRESHOLD = 0.55;

// ─── CLI Arguments ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const modeIdx = args.indexOf('--mode');
const limitIdx = args.indexOf('--limit');

const EVAL_MODE = modeIdx !== -1 ? args[modeIdx + 1] : 'hybrid'; // hybrid | vector | graph
const EVAL_LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;

// ─── Failure Taxonomy ────────────────────────────────────────────────────────
const FAILURE_TYPES = {
  MISSED_CORE_ERROR: 'missed_core_grammar_error',
  MISSED_STRENGTH: 'missed_strength_recognition',
  OVER_DIFFICULT_REC: 'over_difficult_recommendation',
  IRRELEVANT_RETRIEVAL: 'irrelevant_retrieval',
  HARD_NEGATIVE_LEAK: 'hard_negative_leaked',
  BAND_OUT_OF_RANGE: 'band_score_out_of_range',
  DISCOURSE_FLAW_MISSED: 'discourse_flaw_not_detected',
};

// ─── Embedding-based Semantic Similarity ─────────────────────────────────────
let embeddingsModel = null;
const embeddingCache = new Map();

/**
 * Initialize embedding model for semantic matching.
 */
async function initEmbeddings() {
  embeddingsModel = new OllamaEmbeddings({
    model: 'nomic-embed-text',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  });
  console.log('🧠 Semantic matcher initialized (nomic-embed-text).');
}

/**
 * Get embedding with caching to avoid redundant API calls.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function getEmbedding(text) {
  const key = text.toLowerCase().trim();
  if (embeddingCache.has(key)) return embeddingCache.get(key);
  const vec = await embeddingsModel.embedQuery(key);
  embeddingCache.set(key, vec);
  return vec;
}

/**
 * Cosine similarity between two vectors.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
function cosineSim(a, b) {
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  return dot / (Math.sqrt(ma) * Math.sqrt(mb));
}

/**
 * Semantic match: check if ANY retrieved text semantically matches the expected topic.
 * Returns the best matching score.
 * @param {string} expectedTopic
 * @param {string[]} retrievedTexts
 * @returns {Promise<{matched: boolean, bestScore: number, bestMatch: string}>}
 */
async function semanticMatch(expectedTopic, retrievedTexts) {
  const expectedVec = await getEmbedding(expectedTopic);
  let bestScore = 0;
  let bestMatch = '';

  for (const text of retrievedTexts) {
    const textVec = await getEmbedding(text);
    const score = cosineSim(expectedVec, textVec);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = text;
    }
  }

  return {
    matched: bestScore >= SIMILARITY_THRESHOLD,
    bestScore: parseFloat(bestScore.toFixed(4)),
    bestMatch,
  };
}

// ─── Evaluation Functions ────────────────────────────────────────────────────

/**
 * Check if band score is within expected range.
 * @param {number} actual
 * @param {number[]} range [min, max]
 * @returns {boolean}
 */
function isBandInRange(actual, range) {
  if (!range || range.length !== 2) return true; // No range specified = pass
  return actual >= range[0] && actual <= range[1];
}

/**
 * Check error detection against must_detect_errors.
 * Uses semantic matching against dominant error types AND full annotation errors.
 * @param {Object} result - Pipeline result
 * @param {string[]} mustDetect - Expected error types
 * @returns {Promise<{detected: string[], missed: string[], rate: number}>}
 */
async function evaluateErrorDetection(result, mustDetect) {
  if (!mustDetect || mustDetect.length === 0) return { detected: [], missed: [], rate: 1.0 };

  // Collect all error signals from the pipeline result
  const actualErrors = [];

  // From feature_map dominant errors
  if (result.feature_map?.grammar?.dominant_error_types) {
    actualErrors.push(...result.feature_map.grammar.dominant_error_types);
  }

  // From annotated_text errors
  if (result.annotated_text) {
    for (const ann of result.annotated_text) {
      if (ann.annotations) {
        for (const a of ann.annotations) {
          actualErrors.push(a.label || '');
        }
      }
    }
  }

  // From LLM weaknesses
  if (result.weaknesses) {
    actualErrors.push(...result.weaknesses);
  }

  // From coherence issues
  if (result.feature_map?.cohesion?.coherence_issues) {
    for (const issue of result.feature_map.cohesion.coherence_issues) {
      actualErrors.push(issue.type || '');
      actualErrors.push(issue.subType || '');
    }
  }

  // From feature_map direct signals
  if (result.feature_map?.sentence_structure?.fragments > 0) {
    actualErrors.push('sentence_fragments', 'fragment');
  }
  if (result.feature_map?.cohesion?.overused?.length > 0) {
    actualErrors.push('overuse_linking_words');
  }

  const errorTexts = actualErrors.map(e => e.toLowerCase().replace(/[_-]/g, ' '));

  const detected = [];
  const missed = [];

  for (const expected of mustDetect) {
    const normalizedExpected = expected === 'SVA' ? 'subject verb agreement' : expected;
    const { matched } = await semanticMatch(
      normalizedExpected.replace(/[_-]/g, ' '),
      errorTexts
    );
    if (matched) {
      detected.push(expected);
    } else {
      missed.push(expected);
    }
  }

  return {
    detected,
    missed,
    rate: mustDetect.length > 0 ? detected.length / mustDetect.length : 1.0,
  };
}

/**
 * Check strength detection against must_detect_strengths.
 * @param {Object} result
 * @param {string[]} mustDetect
 * @returns {Promise<{detected: string[], missed: string[], rate: number}>}
 */
async function evaluateStrengthDetection(result, mustDetect) {
  if (!mustDetect || mustDetect.length === 0) return { detected: [], missed: [], rate: 1.0 };

  const actualStrengths = [];
  if (result.strengths) actualStrengths.push(...result.strengths);

  const strengthTexts = actualStrengths.map(s => s.toLowerCase().replace(/[_-]/g, ' '));

  const detected = [];
  const missed = [];

  for (const expected of mustDetect) {
    const { matched } = await semanticMatch(
      expected.replace(/[_-]/g, ' '),
      strengthTexts
    );
    if (matched) detected.push(expected);
    else missed.push(expected);
  }

  return {
    detected,
    missed,
    rate: mustDetect.length > 0 ? detected.length / mustDetect.length : 1.0,
  };
}

/**
 * Check retrieval quality using Weighted Recall based on retrieval_ground_truth.json
 * @param {string} evalId
 * @param {Object} result
 * @param {Array} groundTruthList
 * @returns {Promise<{recall: number, details: Array}>}
 */
async function evaluateRetrievalRecall(evalId, result, groundTruthList) {
  const gt = groundTruthList.find(g => g.eval_id === evalId);
  if (!gt || !gt.relevant_nodes || gt.relevant_nodes.length === 0) {
    return { recall: 1.0, details: [] };
  }

  const retrievedTexts = [];
  if (result.rag_debug_info?.knowledge_base_chunks) {
    for (const chunk of result.rag_debug_info.knowledge_base_chunks) {
      retrievedTexts.push(chunk.text || '');
    }
  }

  if (retrievedTexts.length === 0) return { recall: 0, details: gt.relevant_nodes.map(n => ({ topic: n.topic, found: false, score: 0 })) };

  const details = [];
  let totalImportance = 0;
  let achievedImportance = 0;

  for (const node of gt.relevant_nodes) {
    const importance = node.importance || 1.0;
    totalImportance += importance;

    const { matched, bestScore, bestMatch } = await semanticMatch(
      node.topic.replace(/[_-]/g, ' '),
      retrievedTexts
    );

    details.push({
      topic: node.topic,
      importance,
      found: matched,
      bestScore,
      bestMatch: bestMatch.substring(0, 80),
    });

    if (matched) achievedImportance += importance;
  }

  const recall = totalImportance > 0 ? achievedImportance / totalImportance : 1.0;
  
  // Debug log nếu RAG tìm được chunks nhưng trượt hoàn toàn so với Ground Truth
  if (recall === 0 && retrievedTexts.length > 0) {
    console.log(`\n    ⚠️ [DEBUG RAG] RAG fetched ${retrievedTexts.length} chunks but Recall = 0%. Fetched chunks:`);
    retrievedTexts.forEach((t, idx) => console.log(`      ${idx + 1}. ${t.substring(0, 80).replace(/\\n/g, ' ')}...`));
  }

  return {
    recall,
    details,
  };
}

/**
 * Check hard negative filter — these topics should NOT appear in retrieval.
 * @param {Object} result
 * @param {string[]} hardNegatives
 * @returns {Promise<{passRate: number, leaked: string[]}>}
 */
async function evaluateHardNegatives(result, hardNegatives) {
  if (!hardNegatives || hardNegatives.length === 0) return { passRate: 1.0, leaked: [] };

  const retrievedTexts = [];
  if (result.rag_debug_info?.knowledge_base_chunks) {
    for (const chunk of result.rag_debug_info.knowledge_base_chunks) {
      retrievedTexts.push(chunk.text || '');
    }
  }

  // Also check recommendations/feedback text for inappropriate content
  const feedbackTexts = [];
  if (result.recommendations_vn) feedbackTexts.push(result.recommendations_vn);
  if (result.scaffolding_suggestions) {
    for (const s of result.scaffolding_suggestions) {
      feedbackTexts.push(s.logic || '');
    }
  }

  const allOutputTexts = [...retrievedTexts, ...feedbackTexts];
  if (allOutputTexts.length === 0) return { passRate: 1.0, leaked: [] };

  const leaked = [];
  for (const neg of hardNegatives) {
    const { matched, bestScore } = await semanticMatch(
      neg.replace(/[_-]/g, ' '),
      allOutputTexts
    );
    // Use a higher threshold for negatives — only flag if very similar
    if (matched && bestScore > 0.75) {
      leaked.push(neg);
    }
  }

  return {
    passRate: hardNegatives.length > 0 ? (hardNegatives.length - leaked.length) / hardNegatives.length : 1.0,
    leaked,
  };
}

/**
 * Check recommendation relevance (must_recommend vs must_avoid).
 * @param {Object} result
 * @param {string[]} mustRecommend
 * @param {string[]} mustAvoid
 * @returns {Promise<{relevanceRate: number, safetyRate: number, failures: Object[]}>}
 */
async function evaluateRecommendations(result, mustRecommend, mustAvoid) {
  // Gather all recommendation/feedback text from result
  const recTexts = [];
  if (result.recommendations_vn) recTexts.push(result.recommendations_vn);
  if (result.feedback_vn) recTexts.push(result.feedback_vn);
  if (result.scaffolding_suggestions) {
    for (const s of result.scaffolding_suggestions) {
      recTexts.push(`${s.original || ''} ${s.improved || ''} ${s.logic || ''}`);
    }
  }
  if (result.evidence_based_justification_vn) {
    for (const val of Object.values(result.evidence_based_justification_vn)) {
      recTexts.push(val || '');
    }
  }

  const allRecText = recTexts.join(' ').toLowerCase();

  // Evaluate must_recommend (relevance)
  let recFound = 0;
  const failures = [];
  if (mustRecommend && mustRecommend.length > 0) {
    for (const rec of mustRecommend) {
      const { matched } = await semanticMatch(rec.replace(/[_-]/g, ' '), recTexts);
      if (matched) {
        recFound++;
      } else {
        failures.push({ type: 'missed_recommendation', expected: rec });
      }
    }
  }

  // Evaluate must_avoid (safety)
  let avoidPassed = 0;
  const avoidTotal = mustAvoid ? mustAvoid.length : 0;
  if (mustAvoid && mustAvoid.length > 0) {
    for (const avoid of mustAvoid) {
      const { matched, bestScore } = await semanticMatch(avoid.replace(/[_-]/g, ' '), recTexts);
      if (!matched || bestScore < 0.70) {
        avoidPassed++;
      } else {
        failures.push({
          type: FAILURE_TYPES.OVER_DIFFICULT_REC,
          detail: `System recommended "${avoid}" which is too advanced for this student`,
        });
      }
    }
  }

  return {
    relevanceRate: mustRecommend && mustRecommend.length > 0 ? recFound / mustRecommend.length : 1.0,
    safetyRate: avoidTotal > 0 ? avoidPassed / avoidTotal : 1.0,
    failures,
  };
}

/**
 * Classify failures into taxonomy categories.
 * @param {Object} evalResult - Single eval case result
 * @returns {string[]} List of failure types
 */
function classifyFailures(evalResult) {
  const failures = [];

  if (evalResult.errorDetection.missed.length > 0)
    failures.push(FAILURE_TYPES.MISSED_CORE_ERROR);
  if (evalResult.strengthDetection.missed.length > 0)
    failures.push(FAILURE_TYPES.MISSED_STRENGTH);
  if (!evalResult.bandInRange)
    failures.push(FAILURE_TYPES.BAND_OUT_OF_RANGE);
  if (evalResult.hardNegatives.leaked.length > 0)
    failures.push(FAILURE_TYPES.HARD_NEGATIVE_LEAK);
  if (evalResult.recommendations.failures.some(f => f.type === FAILURE_TYPES.OVER_DIFFICULT_REC))
    failures.push(FAILURE_TYPES.OVER_DIFFICULT_REC);

  return failures;
}

/**
 * Build explainability dump — reasoning path from graph for this student.
 * @param {Object} result
 * @returns {Object}
 */
function buildExplainabilityDump(result) {
  const dump = {
    retrieval_sources: [],
    student_memory_used: false,
    graph_coherence_used: false,
    reasoning_paths: [],
  };

  // Retrieval sources
  if (result.rag_debug_info?.knowledge_base_chunks) {
    dump.retrieval_sources = result.rag_debug_info.knowledge_base_chunks.map(c => ({
      text: (c.text || '').substring(0, 100),
      score: c.score,
    }));
  }

  // Student memory
  if (result.rag_debug_info?.student_memory) {
    dump.student_memory_used = true;
    const mem = result.rag_debug_info.student_memory;
    if (mem.past_errors) {
      for (const err of mem.past_errors) {
        dump.reasoning_paths.push(`Student -> MAKES_ERROR -> ${err}`);
      }
    }
    if (mem.past_strengths) {
      for (const str of mem.past_strengths) {
        dump.reasoning_paths.push(`Student -> HAS_STRENGTH -> ${str}`);
      }
    }
  }

  // Graph coherence
  if (result.feature_map?.cohesion?.coherence_issues?.length > 0) {
    dump.graph_coherence_used = true;
    for (const issue of result.feature_map.cohesion.coherence_issues) {
      dump.reasoning_paths.push(
        `Essay -> ${issue.type} -> Sentence${issue.range?.fromSentence ?? '?'} -> ${issue.subType || issue.type}`
      );
    }
  }

  return dump;
}

// ─── Main Runner ─────────────────────────────────────────────────────────────

async function runEvaluation() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  🧪 GraphRAG AI Tutor — Evaluation Benchmark`);
  console.log(`  Mode: ${EVAL_MODE.toUpperCase()} | Limit: ${EVAL_LIMIT === Infinity ? 'ALL' : EVAL_LIMIT}`);
  console.log(`  Semantic Threshold: ${SIMILARITY_THRESHOLD}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Load evaluation data
  const profiles = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'learner_profiles.json'), 'utf-8'));
  const queries = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'eval_queries.json'), 'utf-8'));
  
  let groundTruth = [];
  try {
    groundTruth = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'retrieval_ground_truth.json'), 'utf-8'));
  } catch(e) {
    console.warn("⚠️ Could not load retrieval_ground_truth.json. Will use fallback.");
  }

  const profileMap = {};
  for (const p of profiles) profileMap[p.id] = p;

  const evalCases = queries.slice(0, EVAL_LIMIT);
  console.log(`📋 Loaded ${profiles.length} profiles, ${queries.length} queries. Running ${evalCases.length} cases.\n`);

  // 2. Init embedding model
  await initEmbeddings();

  // 3. Run evaluations
  const allResults = [];
  const aggregated = {
    total: evalCases.length,
    bandAccuracy: 0,
    bandAbsoluteErrorSum: 0, // Dùng để tính MAE
    errorDetectionRate: 0,
    strengthDetectionRate: 0,
    retrievalRecall: 0,
    hardNegativePassRate: 0,
    recommendationRelevance: 0,
    recommendationSafety: 0,
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    failureTaxonomy: {},
  };

  // Initialize failure taxonomy counters
  for (const ft of Object.values(FAILURE_TYPES)) {
    aggregated.failureTaxonomy[ft] = 0;
  }

  for (let i = 0; i < evalCases.length; i++) {
    const evalCase = evalCases[i];
    const profile = profileMap[evalCase.student_id] || null;
    const expected = evalCase.expected;

    console.log(`\n──────────────────────────────────────────────────────────────`);
    console.log(`📝 [${i + 1}/${evalCases.length}] ${evalCase.id} — ${evalCase.scenario}`);
    console.log(`   Student: ${evalCase.student_id} (${profile?.level || 'unknown'})`);
    console.log(`──────────────────────────────────────────────────────────────`);

    let result;
    const startTime = Date.now();

    try {
      // Run the full pipeline
      const studentId = EVAL_MODE === 'vector' ? null : evalCase.student_id;
      const essayId = `eval_${evalCase.id}_${Date.now()}`;

      result = await writingService.analyzeWriting(
        evalCase.essay.trim(),
        evalCase.question,
        'ielts-task2',
        studentId,
        essayId
      );
    } catch (err) {
      console.error(`   ❌ Pipeline crashed: ${err.message}`);
      allResults.push({
        id: evalCase.id,
        scenario: evalCase.scenario,
        status: 'CRASHED',
        error: err.message,
      });
      continue;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ⏱️ Pipeline completed in ${elapsed}s`);

    // ── Evaluate all dimensions ──────────────────────────────────
    const bandInRange = isBandInRange(result.overall_band, expected.band_range?.overall);
    
    // Tính Absolute Error cho Band Score
    let bandError = 0;
    if (!bandInRange && expected.band_range?.overall?.length === 2) {
       if (result.overall_band < expected.band_range.overall[0]) {
           bandError = expected.band_range.overall[0] - result.overall_band;
       } else if (result.overall_band > expected.band_range.overall[1]) {
           bandError = result.overall_band - expected.band_range.overall[1];
       }
    }

    const errorDetection = await evaluateErrorDetection(result, expected.must_detect_errors);
    const strengthDetection = await evaluateStrengthDetection(result, expected.must_detect_strengths);
    
    // Gọi hàm evaluateRetrievalRecall truyền evalId và groundTruth file
    const retrievalResult = await evaluateRetrievalRecall(evalCase.id, result, groundTruth);
    
    const hardNegatives = await evaluateHardNegatives(result, expected.hard_negatives);
    const recommendations = await evaluateRecommendations(result, expected.must_recommend, expected.must_avoid);
    const explainability = buildExplainabilityDump(result);

    const caseResult = {
      id: evalCase.id,
      scenario: evalCase.scenario,
      student: evalCase.student_id,
      status: 'OK',
      elapsed_seconds: parseFloat(elapsed),
      actual_band: result.overall_band,
      actual_breakdown: result.band_breakdown,
      bandInRange,
      errorDetection,
      strengthDetection,
      retrieval: retrievalResult,
      hardNegatives,
      recommendations,
      explainability,
      failureTypes: [],
      // ── Full LLM output for GPT-as-Judge (eval-judge.js) ──────
      feedback_vn: result.feedback_vn || '',
      recommendations_vn: result.recommendations_vn || '',
      scaffolding_suggestions: result.scaffolding_suggestions || [],
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      evidence_based_justification_vn: result.evidence_based_justification_vn || {},
      usage: result.usage || { prompt_tokens: 0, completion_tokens: 0 }
    };

    // Classify failures
    caseResult.failureTypes = classifyFailures(caseResult);

    // Print summary for this case
    console.log(`   📊 Band: ${result.overall_band} ${bandInRange ? '✅' : '❌'} (expected: ${expected.band_range?.overall?.join('-')})`);
    console.log(`   🔍 Errors: ${errorDetection.rate.toFixed(0) * 100}% detected (${errorDetection.detected.length}/${expected.must_detect_errors?.length || 0})`);
    if (errorDetection.missed.length > 0) console.log(`      ❌ Missed: ${errorDetection.missed.join(', ')}`);
    console.log(`   💪 Strengths: ${(strengthDetection.rate * 100).toFixed(0)}% detected`);
    console.log(`   🔵 Retrieval Recall: ${(retrievalResult.recall * 100).toFixed(0)}%`);
    console.log(`   🛡️ Hard Negative Pass: ${(hardNegatives.passRate * 100).toFixed(0)}%`);
    console.log(`   🎯 Recommendation Relevance: ${(recommendations.relevanceRate * 100).toFixed(0)}%`);
    console.log(`   🔒 Recommendation Safety: ${(recommendations.safetyRate * 100).toFixed(0)}%`);
    if (caseResult.failureTypes.length > 0) {
      console.log(`   ⚠️ Failures: ${caseResult.failureTypes.join(', ')}`);
    }
    if (explainability.reasoning_paths.length > 0) {
      console.log(`   🧩 Reasoning Paths: ${explainability.reasoning_paths.length} paths traced`);
    }

    // Accumulate
    allResults.push(caseResult);
    if (bandInRange) aggregated.bandAccuracy++;
    aggregated.bandAbsoluteErrorSum += bandError;
    aggregated.errorDetectionRate += errorDetection.rate;
    aggregated.strengthDetectionRate += strengthDetection.rate;
    aggregated.retrievalRecall += retrievalResult.recall;
    aggregated.hardNegativePassRate += hardNegatives.passRate;
    aggregated.recommendationRelevance += recommendations.relevanceRate;
    aggregated.recommendationSafety += recommendations.safetyRate;
    
    // Cộng dồn Tokens nếu service có trả về
    if (caseResult.usage) {
      aggregated.totalPromptTokens += caseResult.usage.prompt_tokens || 0;
      aggregated.totalCompletionTokens += caseResult.usage.completion_tokens || 0;
    }

    for (const ft of caseResult.failureTypes) {
      aggregated.failureTaxonomy[ft] = (aggregated.failureTaxonomy[ft] || 0) + 1;
    }

    // Delay between cases to avoid overloading Ollama
    if (i < evalCases.length - 1) {
      console.log(`   ⏳ Cooling down 3s...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  // ── Final Report ───────────────────────────────────────────────
  const n = allResults.filter(r => r.status === 'OK').length;

  const report = {
    meta: {
      mode: EVAL_MODE,
      total_cases: evalCases.length,
      completed: n,
      crashed: allResults.filter(r => r.status === 'CRASHED').length,
      timestamp: new Date().toISOString(),
      similarity_threshold: SIMILARITY_THRESHOLD,
    },
    scores: {
      band_accuracy: n > 0 ? parseFloat((aggregated.bandAccuracy / n * 100).toFixed(1)) : 0,
      band_mae: n > 0 ? parseFloat((aggregated.bandAbsoluteErrorSum / n).toFixed(2)) : 0,
      error_detection_rate: n > 0 ? parseFloat((aggregated.errorDetectionRate / n * 100).toFixed(1)) : 0,
      strength_detection_rate: n > 0 ? parseFloat((aggregated.strengthDetectionRate / n * 100).toFixed(1)) : 0,
      retrieval_recall: n > 0 ? parseFloat((aggregated.retrievalRecall / n * 100).toFixed(1)) : 0,
      hard_negative_pass_rate: n > 0 ? parseFloat((aggregated.hardNegativePassRate / n * 100).toFixed(1)) : 0,
      recommendation_relevance: n > 0 ? parseFloat((aggregated.recommendationRelevance / n * 100).toFixed(1)) : 0,
      recommendation_safety: n > 0 ? parseFloat((aggregated.recommendationSafety / n * 100).toFixed(1)) : 0,
    },
    resource_usage: {
      total_prompt_tokens: aggregated.totalPromptTokens,
      total_completion_tokens: aggregated.totalCompletionTokens,
      estimated_cost_usd: parseFloat(((aggregated.totalPromptTokens * 0.15 + aggregated.totalCompletionTokens * 0.6) / 1000000).toFixed(4)) // Tính theo giá Gemini 1.5 Flash
    },
    failure_taxonomy: aggregated.failureTaxonomy,
    per_case_results: allResults,
  };

  // Save results
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(report, null, 2), 'utf-8');

  // Print final report
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log(`  📊 EVALUATION REPORT — ${EVAL_MODE.toUpperCase()} MODE`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Cases: ${n} completed / ${evalCases.length} total`);
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`  Band Accuracy:              ${report.scores.band_accuracy}%`);
  console.log(`  Band MAE (Mean Abs Error):  ${report.scores.band_mae}`);
  console.log(`  Error Detection Rate:       ${report.scores.error_detection_rate}%`);
  console.log(`  Strength Detection Rate:    ${report.scores.strength_detection_rate}%`);
  console.log(`  Retrieval Recall (semantic): ${report.scores.retrieval_recall}%`);
  console.log(`  Hard Negative Pass Rate:    ${report.scores.hard_negative_pass_rate}%`);
  console.log(`  Recommendation Relevance:   ${report.scores.recommendation_relevance}%`);
  console.log(`  Recommendation Safety:      ${report.scores.recommendation_safety}%`);
  console.log('───────────────────────────────────────────────────────────────');
  console.log('  FAILURE TAXONOMY:');
  for (const [type, count] of Object.entries(report.failure_taxonomy)) {
    if (count > 0) console.log(`    ⚠️ ${type}: ${count}/${n}`);
  }
  console.log('───────────────────────────────────────────────────────────────');
  console.log('  RESOURCE USAGE:');
  console.log(`  Prompt Tokens:              ${report.resource_usage.total_prompt_tokens.toLocaleString()}`);
  console.log(`  Completion Tokens:          ${report.resource_usage.total_completion_tokens.toLocaleString()}`);
  console.log(`  Estimated Cost (Gemini):    $${report.resource_usage.estimated_cost_usd}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  💾 Detailed results saved to: ${RESULTS_PATH}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  process.exit(0);
}

runEvaluation().catch(err => {
  console.error('💥 Evaluation runner crashed:', err);
  process.exit(1);
});
