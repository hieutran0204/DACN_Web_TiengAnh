/**
 * services/writing.service.js
 *
 * ✅ GraphRAG Writing Pipeline — Dual-Node Architecture
 *
 * Flow:
 *   1. 🧱 Pre-processing    : Split essay into sentences & paragraphs.
 *   2. 🔍 Phase 1A          : Micro-Evaluator detects specific errors per sentence.
 *   3. 🧩 Phase 1B          : Rule-Based classifies structure, linking words, academic words.
 *   4. 📊 Phase 1.5         : Feature Builder aggregates into normalized metrics & annotations.
 *   5. 🛑 Phase 2.5         : Band Constraint Engine calculates Hard Caps.
 *   6. 🔵 Retrieval         : Vector store (knowledge + skeletons) + Neo4j graph context.
 *   7. 🔒 Node 1 (NEW)      : Deterministic Scoring Engine LOCKS band scores.
 *   8. 🤖 Node 2 (NEW)      : LLM Feedback Generator explains locked scores.
 *   9. 🔺 Triplet extract   : Parse new errors for graph update.
 */

const llmConfig       = require('../config/llm.config');
const memoryService   = require('./graph/memory.service');
const { buildContext, extractTripletsFromResult } = require('./rag/context-builder');

const microEvaluator      = require('./ai/micro-evaluator.service');
const ruleBased           = require('./nlp/rule-based.service');
const featureBuilder      = require('./rag/feature-builder');
const constraintEngine    = require('./ai/band-constraint.engine');
const scoringEngine       = require('./ai/scoring.engine');       // Node 1
const feedbackGenerator   = require('./ai/macro-evaluator.service'); // Node 2
const essayGraphRepo      = require('../repositories/essay-graph.repository');
const pythonBridge        = require('./nlp/python-bridge.service');
const discourseClassifier = require('./ai/discourse-classifier.service');
const vectorStore         = require('./ai/vector-store.service');
const topicRelevance      = require('./nlp/topic-relevance.service');
const rubricChecklist     = require('./ai/rubric-checklist.service');
// Phase 2 — Examiner Simulation Model
const discourseGraph      = require('./nlp/discourse-graph.service');
const collocEmbedding     = require('./nlp/collocation-embedding.service');

// ─── JSON Parser ─────────────────────────────────────────────────────────────
const extractJSON = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end   = cleaned.lastIndexOf('}') + 1;
    if (start === -1 || end === 0) throw new Error('No JSON found');
    return JSON.parse(cleaned.substring(start, end));
  } catch (e) {
    console.error('❌ JSON parse error:', text.substring(0, 800));
    return { error: 'AI returned invalid JSON', raw: text.substring(0, 1000) };
  }
};


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

  // ── 0. ⏱️ Pipeline Telemetry Bootstrap ─────────────────────────────────
  // Track pipeline start and accumulate degraded-mode signals throughout.
  // The final result always contains pipeline_latency_ms, degraded_mode,
  // and degraded_reasons so clients/supervisors can assess result quality.
  const pipelineStart    = Date.now();
  const degradedReasons  = [];

  // ── 1. 🧱 Pre-processing (Hybrid: Rule + Python) ─────────────────────────
  const pythonRaw = await pythonBridge.getAdvancedNLP(essay);

  // Python bridge now returns { sentences, grammar_errors, advanced_structures, implicit_cohesion }.
  // Backward-compatible: if output is an Array (old format), treat it as sentences-only.
  const pythonData   = pythonRaw && !Array.isArray(pythonRaw) ? pythonRaw.sentences         : pythonRaw;
  const ltGrammarData = pythonRaw && !Array.isArray(pythonRaw) ? pythonRaw.grammar_errors   : null;
  const spaCyStructs  = pythonRaw && !Array.isArray(pythonRaw) ? pythonRaw.advanced_structures : [];
  const implicitCoh   = pythonRaw && !Array.isArray(pythonRaw) ? pythonRaw.implicit_cohesion : {};

  const sentences = pythonData ? pythonData.map(s => s.text) : ruleBased.splitSentences(essay);
  console.log(`🧱 Split essay into ${sentences.length} sentences via ${pythonData ? 'Python/LanguageTool' : 'Compromise'}.`);

  // ── 2. 🔍 Phase 1A & 1B: Micro-Evaluation (Concurrent) + Rule-Based ─────────
  // processSentences() uses a bounded concurrency pool (MICRO_CONCURRENCY, default 3).
  // This replaces the old sequential for-loop that called discourseClassifier.classify()
  //
  // Architecture:
  //   Phase A — Parallel: Send all sentences to Ollama micro-evaluator via pool.
  //   Phase B — Sequential (cheap): Enrich each result with pythonData markers/lemmas,
  //             apply rule-based role fallback for sentences that got "Unknown" roles,
  //    
  console.log(`🔍 Running Micro-Evaluator (concurrency pool) and Rule-Based extraction...`);

  // ── Phase A: Parallel Ollama micro-evaluation ────────────────────────────────
  const rawMicroResults = await microEvaluator.processSentences(sentences);
  const enrichedSentencesForGraph = [];

  // -- Phase B: Enrich + Rule-Based (PARALLEL) ----------------------------------
  // CPU-only enrichment first (no I/O), then batch all ruleBased.analyzeSentence
  // calls with Promise.all instead of sequential await-in-loop.
  const _roleMeta = sentences.map((sentence, i) => {
    const pData   = pythonData && pythonData[i] ? pythonData[i] : null;
    const markers = pData ? (pData.markers || []) : [];
    const raw     = rawMicroResults[i] || {};
    let finalRole = raw.discourse_role || 'Unknown';
    if (finalRole === 'Unknown' || !finalRole) {
      finalRole = discourseClassifier._fallbackToRules(sentence, markers, i).role;
    }
    finalRole = finalRole.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
    enrichedSentencesForGraph[i] = {
      ...(pData || { index: i, text: sentence, markers }),
      role: finalRole
    };
    return { sentence, finalRole, pData, raw };
  });

  // Batch all rule-based calls in parallel (no Ollama, fast regex/CPU)
  const _ruleResultsRaw = await Promise.all(
    _roleMeta.map(async ({ sentence, pData }, i) => {
      try {
        return await ruleBased.analyzeSentence(sentence, i, pData ? pData.lemmas : null);
      } catch (err) {
        console.error(`Rule-based fallback sentence ${i}:`, err.message);
        return { wordCount: 0, linkingWords: [] };
      }
    })
  );

  const microResults = _roleMeta.map(({ sentence, finalRole, raw }) => ({
    sentence,
    discourse_role: finalRole,
    errors:         raw.errors || [],
    is_error_free:  (raw.errors || []).length === 0,
    method:         raw.method || 'fallback',
  }));
  const ruleResults = _ruleResultsRaw;

  _roleMeta.forEach(({ finalRole }, i) =>
    console.log(` 🧩 Layer 2: Enriched sentence ${i + 1}/${sentences.length} | role=${finalRole}`)
  );

  // ── 3. 📊 Phase 1.5: Feature Builder ──────────────────────────────────────
  const { feature_map, annotations } = featureBuilder.buildFeatures(microResults, ruleResults, essay, ruleBased);
  
  // Attach discourse roles to annotations for UI highlighting
  microResults.forEach((res, i) => {
    if (annotations[i]) {
      annotations[i].discourse_role = res.discourse_role;
    }
  });
  console.log("📊 Feature Map generated.");

  // 🔥 VÁ LỖI CHÍ MẠNG: Chủ động ép số lượng từ và câu thực tế vào Feature Map
  if (!feature_map.statistics) feature_map.statistics = {};
  feature_map.statistics.word_count = essay.trim().split(/\s+/).filter(Boolean).length;
  feature_map.statistics.sentence_count = sentences.length;
  // Quality flag: signals whether Python NLP (spaCy) was available.
  // If false, discourse roles and markers are less reliable (Compromise fallback).
  feature_map.statistics.python_nlp_available = pythonBridge.isHealthy;
  if (!pythonBridge.isHealthy) {
    const reason = 'Python NLP (spaCy) unavailable — discourse roles and sentence embeddings less accurate (Compromise fallback active)';
    console.warn(`⚠️ Pipeline running in DEGRADED MODE: ${reason}`);
    degradedReasons.push(reason);
  }

  // 🔥 NHÁT DAO CHÍ MẠNG: Gọt mảng từ vựng trước khi ném vào Layer 5
  if (feature_map.lexical_resource && feature_map.lexical_resource.advanced_words) {
    if (feature_map.lexical_resource.advanced_words.length > 20) {
      console.log(`✂️ Nén Context: Cắt mảng advanced_words từ ${feature_map.lexical_resource.advanced_words.length} xuống 20 từ tiêu biểu.`);
      // Cắt mảng chữ thô để làm nhẹ Prompt, NHƯNG giữ nguyên đếm tổng "advanced_vocab_count"
      feature_map.lexical_resource.advanced_words = feature_map.lexical_resource.advanced_words.slice(0, 20);
    }
  }

  // -- 3.5 + 4.5 + Memory: PARALLEL BLOCK 1 ------------------------------------
  // topicRelevance, graph coherence pipeline, and student memory are independent.
  // Run all three concurrently; constraintEngine waits for topicRelevance result.
  const sentenceEmbeddingsForTR = (pythonData || [])
    .map(s => s.embedding).filter(e => e && e.length > 0);

  // Helper: encapsulates the internally-sequential graph pipeline
  const _runGraphPipeline = async () => {
    if (!essayId) return [];
    try {
      await essayGraphRepo.saveEssayPipeline(essayId, studentId, enrichedSentencesForGraph);
      // Threshold raised 0.45 → 0.55: paragraph-boundary topic shifts were triggering
      // ~20% false positives at 0.45. At 0.55 only genuinely abrupt incoherence is flagged.
      const jumps       = await essayGraphRepo.checkCoherenceJumps(essayId, 0.55);
      const flaws       = await essayGraphRepo.checkArgumentStructureFlaws(essayId);
      await essayGraphRepo.upgradeToKnowledgeGraph(essayId);
      const unsupported = await essayGraphRepo.checkUnsupportedClaims(essayId);
      const issues      = [...jumps, ...flaws, ...unsupported];
      console.log(`⛓️ Coherence scan complete: ${issues.length} issues detected.`);
      return issues;
    } catch (err) {
      degradedReasons.push(
        `Graph coherence scan failed (Neo4j unavailable): CC score may be inflated -- ${err.message}`
      );
      console.error('❌ Graph Pipeline failed:', err.message);
      return [];
    }
  };

  console.log('Parallel Block 1: topicRelevance + graph pipeline + student memory + rubricChecklist...');
  const [trReport, coherenceIssues, graphContext, checklistResult] = await Promise.all([
    topicRelevance.analyze(question, essay, sentenceEmbeddingsForTR),
    _runGraphPipeline(),
    studentId
      ? memoryService.getStudentMemory(studentId).catch(err => {
          console.warn('⚠️ Graph retrieval failed (non-fatal):', err.message);
          return { errors: [], strengths: [], hasHistory: false };
        })
      : Promise.resolve({ errors: [], strengths: [], hasHistory: false }),
    rubricChecklist.evaluate(essay, question, type).catch(err => {
      console.warn('⚠️ RubricChecklist failed (non-fatal):', err.message);
      return { checklist_score: 6.0, checklist_ratio: 0.5, checklist_items: [], checklist_label: 'unavailable', type_used: 'generic' };
    }),
  ]);

  // Inject TR into featureMap (required by constraintEngine)
  feature_map.task_response = {
    relevance_score:        trReport.relevance_score,
    semantic_score:         trReport.semantic_score,
    keyword_score:          trReport.keyword_score,
    parts_coverage:         trReport.parts_coverage,
    missed_keywords:        trReport.missed_keywords,
    question_keyword_count: trReport.question_keyword_count,
    verdict:                trReport.verdict,
    tr_band_cap:            trReport.tr_band_floor,
    tr_method:              trReport.method,
    // Phase 1 — Rubric Checklist signals (Examiner Simulation Model)
    checklist_score:        checklistResult.checklist_score,
    checklist_ratio:        checklistResult.checklist_ratio,
    checklist_items:        checklistResult.checklist_items,
    checklist_label:        checklistResult.checklist_label,
    checklist_type:         checklistResult.type_used,
  };
  feature_map.cohesion.coherence_issues = coherenceIssues;
  if (studentId) console.log(`Graph memory: retrieved for student ${studentId}`);

  // -- 4. Constraint Engine (AFTER topicRelevance injects task_response) --------
  const hardCaps = constraintEngine.calculateCaps(feature_map);

  // -- 5. PARALLEL BLOCK 2: vector knowledge + skeleton + essay graph context ---
  const _specificErrors = [];
  annotations.forEach(ann =>
    (ann.annotations || []).forEach(e => { if (e.label) _specificErrors.push(e.label); })
  );
  if (feature_map?.cohesion?.has_mechanical_transitions)
    _specificErrors.push('overuse of mechanical transition words');
  if ((feature_map?.cohesion?.coherence_issues || []).some(i => i.subType === 'UNSUPPORTED_CLAIM'))
    _specificErrors.push('unsupported claim missing evidence or example');
  const _errorContext = _specificErrors.length > 0
    ? [...new Set(_specificErrors)].slice(0, 5).join(', ')
    : (feature_map.grammar.dominant_error_types || []).join(', ');
  const _searchQuery = `IELTS Writing ${type}. How to fix and improve: ${_errorContext}`;
  const _skeletonStr = (microResults || [])
    .map(r => `[${(r.discourse_role || 'sentence').toUpperCase()}] ${r.sentence}`)
    .join(' ');

  console.log('Parallel Block 2: vector knowledge + skeleton + essay graph context + discourse graph + collocation embedding...');
  const [vectorContext, _skeletons, currentEssayGraphContext, discourseResult, collocResult] = await Promise.all([
    vectorStore.searchGeneralKnowledge(_searchQuery, 3).catch(err => {
      console.warn('Vector retrieval failed:', err.message); return [];
    }),
    vectorStore.searchSimilarSkeletons(_skeletonStr, 1).catch(err => {
      console.warn('Layer 4 retrieval failed:', err.message); return [];
    }),
    essayId
      ? essayGraphRepo.getArgumentationGraphContext(essayId).catch(err => {
          console.warn('Failed to fetch Argumentation Graph context:', err.message); return '';
        })
      : Promise.resolve(''),
    // Phase 2: CC Discourse Graph
    discourseGraph.analyze(essay, question).catch(err => {
      console.warn('⚠️ DiscourseGraph failed (non-fatal):', err.message);
      return { graph_cc_score: null, reasons: [], graph_stats: {}, nodes: [], edges: [] };
    }),
    // Phase 2: LR Collocation Embedding Similarity
    collocEmbedding.analyze(essay).catch(err => {
      console.warn('⚠️ CollocationEmbedding failed (non-fatal):', err.message);
      return { collocation_similarity_score: null, collocation_density: 0, collocation_hits_high: 0, collocation_hits_mid: 0, top_collocations: [], label: 'unavailable' };
    }),
  ]);
  console.log(`Vector: ${vectorContext.length} chunks | Discourse graph: ${discourseResult.graph_stats?.total_nodes ?? 0} nodes | Colloc: ${collocResult.collocation_hits_high} high hits`);

  // Inject Phase 2 signals into feature_map
  feature_map.discourse_graph = {
    graph_cc_score:  discourseResult.graph_cc_score,
    graph_reasons:   discourseResult.reasons,
    graph_stats:     discourseResult.graph_stats,
    nodes:           discourseResult.nodes,
    edges:           discourseResult.edges,
  };
  feature_map.lexical_resource.collocation_similarity_score = collocResult.collocation_similarity_score;
  feature_map.lexical_resource.collocation_density          = collocResult.collocation_density;
  feature_map.lexical_resource.collocation_hits_high        = collocResult.collocation_hits_high;
  feature_map.lexical_resource.collocation_hits_mid         = collocResult.collocation_hits_mid;
  feature_map.lexical_resource.top_collocations_embedding   = collocResult.top_collocations;

  // ── Inject LanguageTool GRA signals into feature_map.grammar ─────────────
  // These are used by ScoringEngine._computeGRA() to prefer deterministic
  // error_per_100_words over the unreliable Small LLM-counted rate.
  if (ltGrammarData && ltGrammarData.available) {
    feature_map.grammar.language_tool_error_rate  = ltGrammarData.error_per_100_words;
    feature_map.grammar.language_tool_major_count = ltGrammarData.major_count;
    feature_map.grammar.language_tool_available   = true;
    feature_map.grammar.language_tool_categories  = ltGrammarData.error_categories;
    console.log(`✅ LanguageTool GRA: ${ltGrammarData.error_per_100_words}/100w, major=${ltGrammarData.major_count}`);
  } else {
    feature_map.grammar.language_tool_available = false;
    if (!ltGrammarData) {
      console.warn('⚠️ LanguageTool unavailable — GRA will use Small LLM error rate (less accurate).');
    }
  }

  // ── Inject spaCy advanced structure count (variety set) ──────────────────
  // spaCy dependency parse gives accurate advanced structure variety (Set.size).
  // Used by ScoringEngine GRA range bonus instead of regex-based count.
  if (spaCyStructs && spaCyStructs.length > 0) {
    feature_map.grammar.spacy_structure_count = spaCyStructs.length;
    feature_map.grammar.spacy_structures      = spaCyStructs;
    console.log(`✅ spaCy structures: ${spaCyStructs.length} distinct types → [${spaCyStructs.join(', ')}]`);
  }

  // ── Inject implicit cohesion signal into feature_map ─────────────────────
  // Python bridge computes pronoun reference ratio + lexical chains.
  // ScoringEngine._computeCC() uses this to give implicit cohesion bonus
  // for Band 7.5-8 essays that use reference chains instead of explicit linking.
  if (implicitCoh && typeof implicitCoh === 'object') {
    feature_map.implicit_cohesion = implicitCoh;
    console.log(
      `✅ Implicit cohesion: pronounRatio=${implicitCoh.pronoun_reference_ratio}, ` +
      `lexicalChains=${implicitCoh.has_lexical_chains} (${implicitCoh.lexical_chain_count})`
    );
  }

  let structuralContext = '';
  if (_skeletons.length > 0) {
    const sk = _skeletons[0];
    structuralContext =
      `--- HIGH-BAND STRUCTURAL SKELETON (BAND ${sk.essay_band}) ---\n` +
      `Category: ${sk.topic_category}\n` +
      `Ideal Path: ${sk.structure_path}\n` +
      `Sample Implementation: "${sk.content_representation}"\n` +
      `Pedagogical Guidance: ${sk.feedback_template}\n` +
      `--- END STRUCTURAL SKELETON ---\n`;
    console.log(`Layer 4: Found matching Band ${sk.essay_band} skeleton.`);
  }

  // -- 6. Context & Prompt Injection --------------------------------------------
  const ragContext = [
    buildContext(graphContext, vectorContext),
    currentEssayGraphContext,
    structuralContext
  ].filter(Boolean).join('\n\n');
  
  // ── 7. 🔒 Node 1: Deterministic Scoring Engine ─────────────────────────────
  // Scores are computed algorithmically from feature_map + hardCaps.
  // This happens BEFORE the LLM call — the LLM cannot override these scores.
  const lockedScores = scoringEngine.computeScores(feature_map, hardCaps);

  // ── 8. 🤖 Node 2: LLM Feedback Generator ──────────────────────────────────
  // LLM receives locked scores and generates ONLY pedagogical feedback.
  // No scoring task → no prior conflict → compliance rate significantly higher.
  let result;
  try {
    result = await feedbackGenerator.generate(
      essay,
      question,
      type,
      ragContext,
      lockedScores,
      annotations,
      feature_map
    );
    console.log(`✅ Node 2: Feedback complete. Band: ${result.overall_band}`);
  } catch (err) {
    console.error('❌ Pipeline Feedback Generator Error:', err.message);
    throw err;
  }

  if (result.error) return result;

  // ── 9. 🩹 Post-Processing: Integrate with UI Format ──────────────────────
  result.annotated_text    = annotations;
  result.feature_map       = feature_map;
  result.hard_caps_applied = hardCaps;
  result.scoring_reasons   = lockedScores.scoring_reasons; // expose for debugging

  // ── 9.5 ⏱️ Pipeline Telemetry ─────────────────────────────────────────
  // Always inject latency and degraded-mode info so every consumer
  // can assess result quality without grepping server logs.
  const pipelineLatencyMs = Date.now() - pipelineStart;
  result.pipeline_latency_ms = pipelineLatencyMs;
  result.degraded_mode       = degradedReasons.length > 0;
  result.degraded_reasons    = degradedReasons;
  if (result.degraded_mode) {
    console.warn(`⚠️ DEGRADED MODE ACTIVE (${degradedReasons.length} signal(s)): ${degradedReasons.join(' | ')}`);
  }
  console.log(`⏱️ Pipeline total: ${(pipelineLatencyMs / 1000).toFixed(1)}s | degraded=${result.degraded_mode}`);

  // ── 9. 🏁 Final Metadata & RAG Debug ──────────────────────────────────────
  result.generated_at   = new Date().toISOString();
  result.type           = type;
  result.graphrag_used  = !!studentId;   
  result.model_source   = process.env.MACRO_MODEL_NAME || process.env.AI_MODEL || 'ollama';
  
  result.rag_debug_info = {
    knowledge_base_chunks: vectorContext.map(v => ({ text: v.text, score: v.score })),
    student_memory: (graphContext && graphContext.hasHistory) ? {
        past_errors: graphContext.errors.map(e => e.error),
        past_strengths: graphContext.strengths.map(s => s.strength)
    } : null
  };

  // ── 10. 🔺 Triplet Extraction & Graph Update ──────────────────────────────
  if (studentId && essayId) {
    try {
      const triplets = extractTripletsFromResult(result);
      // Pass originalText as an explicit 4th argument — avoids monkey-patching a
      // property onto the Array object (fragile implicit coupling).
      memoryService.updateStudentMemory(studentId, essayId, triplets, essay).catch(err =>
        console.error("❌ Async graph update failed:", err.message)
      );
    } catch (err) {
      console.warn("⚠️ Triplet extraction failed:", err.message);
    }
  }

  return result;
};

module.exports = { analyzeWriting };
