/**
 * Phase 1.5: Feature Builder (Aggregation Layer)
 * 
 * Aggregates raw data from Phase 1A (Micro-Evaluator) and Phase 1B (Rule-based)
 * into a structured Feature Map with normalized metrics.
 * 
 * Includes explicit Mapping for Major vs Minor severities.
 */

const MAJOR_ERRORS = ["SVA", "SUBJECT-VERB AGREEMENT", "TENSE", "VERB TENSE", "FRAGMENT", "RUN-ON"];

class FeatureBuilder {
  
  _enforceSeverity(errorType) {
    const typeUpper = errorType.toUpperCase();
    for (const major of MAJOR_ERRORS) {
      if (typeUpper.includes(major)) return "major";
    }
    return "minor"; // Spelling, preposition, article etc. are minor
  }

  buildFeatures(microResults, ruleResults, fullEssayText, ruleBasedService) {
    const totalSentences = Math.max(microResults.length, ruleResults.length);
    if (totalSentences === 0) return { feature_map: {}, annotations: [] };

    let totalWords = 0;
    let totalErrors = 0;
    let errorFreeSentences = 0;
    
    const errorTypeCounts = {};
    const severityCounts = { major: 0, minor: 0 };
    
    const structureCounts = { simple: 0, compound: 0, complex: 0, fragment: 0 };
    const advancedStructureGlobalSet = new Set(); // distinct types — for VARIETY/RANGE assessment
    let advancedStructureTotalCount = 0;           // total instances — for RESCUE clause (parser protection)
    const linkingWordCounts = {};
    let totalLinkingWords = 0;
    const discourseCounts = { topic_sentence: 0, supporting_detail: 0, example: 0, conclusion: 0, transitional: 0, unknown: 0 };
    let advancedVocabSet = new Set();
    let lessCommonVocabSet = new Set();
    let collocationsSet = new Set();
    const annotations = [];

    for (let i = 0; i < totalSentences; i++) {
      const mRes = microResults[i] || { discourse_role: "unknown", errors: [], is_error_free: true, sentence: "" };
      const rawRole = mRes.discourse_role || "unknown";
      const role = rawRole.toLowerCase().trim().replace(/[\s-]+/g, '_');
      discourseCounts[role] = (discourseCounts[role] || 0) + 1;
      
      const rRes = ruleResults[i] || { type: "simple", word_count: 0, linking_words: [], academic_words: [], is_fragment: false, sentence: "" };
      
      const sentence = mRes.sentence || rRes.sentence;
      totalWords += (rRes.word_count || sentence.split(/\s+/).length);
      
      // Structure Stats
      if (rRes.is_fragment) structureCounts.fragment++;
      else if (rRes.type) structureCounts[rRes.type] = (structureCounts[rRes.type] || 0) + 1;
      
      // Advanced Grammar Structures Stats
      // Track BOTH type variety (Set) and total frequency (counter):
      //   - variety (Set.size) → used by ScoringEngine range bonus (Cambridge: "a variety of complex structures")
      //   - frequency (counter) → used by BandConstraintEngine rescue clause (protect against C2 parser errors)
      if (rRes.advanced_structures) {
        rRes.advanced_structures.forEach(struct => {
          advancedStructureGlobalSet.add(struct); // each type counted once for variety
          advancedStructureTotalCount++;           // total instances for frequency
        });
      }
      
      // Linking Words Stats
      if (rRes.linking_words) {
        for (const lw of rRes.linking_words) {
          totalLinkingWords++;
          const word = lw.word.toLowerCase();
          linkingWordCounts[word] = (linkingWordCounts[word] || 0) + 1;
        }
      }

      // Academic Vocab Stats (Words & Collocations)
      if (rRes.collocations) {
        for (const col of rRes.collocations) {
          collocationsSet.add(col.toLowerCase());
        }
      }
      
      if (rRes.academic_words) {
        for (const aw of rRes.academic_words) {
          advancedVocabSet.add(aw.toLowerCase());
        }
      }
      
      if (rRes.less_common_words) {
        for (const lw of rRes.less_common_words) {
          lessCommonVocabSet.add(lw.toLowerCase());
        }
      }

      // Grammar Stats
      if (mRes.is_error_free) {
        errorFreeSentences++;
      } else {
        totalErrors += (mRes.errors || []).length;
        for (const err of mRes.errors || []) {
          const type = (err.type || "UNKNOWN").toUpperCase();
          errorTypeCounts[type] = (errorTypeCounts[type] || 0) + 1;
          
          // Enforce IELTS rule for severity instead of trusting small AI
          err.severity = this._enforceSeverity(type);

          if (err.severity === "major") severityCounts.major++;
          else severityCounts.minor++;
        }
      }

      // Build Annotations
      if (mRes.errors && mRes.errors.length > 0) {
        annotations.push({
          sentence_index: i,
          sentence: sentence,
          annotations: mRes.errors.map(err => ({
            start: err.start,
            end: err.end,
            label: (err.type || "ERROR").toUpperCase(),
            severity: err.severity,
            span: err.span || "",
            suggestion: err.suggestion || "",
            explanation_vn: err.explanation_vn || ""
          }))
        });
      } else {
        annotations.push({
          sentence_index: i,
          sentence: sentence,
          annotations: []
        });
      }
    }

    // Paragraph count, AWL Coverage, Word Family Coverage, Cliché Analysis, and Register Analysis
    const paragraphs       = ruleBasedService.splitParagraphs(fullEssayText);
    const awlCoverage      = ruleBasedService.calculateAWLCoverage(fullEssayText);
    const wordFamilyReport = ruleBasedService.calculateWordFamilyCoverage(fullEssayText);
    const clicheReport     = ruleBasedService.detectClichePhrases(fullEssayText);
    // Register: detect informal vocabulary (contractions, slang) that violate academic register.
    // Cambridge LR descriptor penalizes inappropriate register — this signal feeds ScoringEngine._computeLR().
    const registerReport = ruleBasedService.detectInformalRegister(fullEssayText);

    // Normalization
    const error_per_100_words = totalWords > 0 ? (totalErrors / totalWords) * 100 : 0;
    const error_free_sentence_ratio = totalSentences > 0 ? (errorFreeSentences / totalSentences) : 0;
    const error_density = totalWords > 0 ? (totalErrors / totalWords) : 0;

    const dominant_error_types = Object.entries(errorTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    const overused_linking_words = Object.entries(linkingWordCounts)
      .filter(entry => entry[1] >= 3)
      .map(entry => entry[0]);

    const feature_map = {
      grammar: {
        total_errors: totalErrors,
        error_density: parseFloat(error_density.toFixed(3)),
        error_per_100_words: parseFloat(error_per_100_words.toFixed(2)),
        error_free_sentence_ratio: parseFloat(error_free_sentence_ratio.toFixed(2)),
        severity_breakdown: severityCounts,
        dominant_error_types: dominant_error_types
      },
      sentence_structure: {
        total_sentences: totalSentences,
        total_words: totalWords,
        paragraph_count: paragraphs.length,
        simple: structureCounts.simple,
        compound: structureCounts.compound,
        complex: structureCounts.complex,
        fragments: structureCounts.fragment,
        advanced_structure_count: advancedStructureTotalCount,       // total instances (frequency) — rescue clause
        advanced_structure_types: advancedStructureGlobalSet.size,    // distinct categories — range/variety bonus
        advanced_structures: Array.from(advancedStructureGlobalSet)   // list of detected types
      },
      lexical_resource: {
        awl_coverage:           parseFloat((awlCoverage * 100).toFixed(2)), // percentage (density signal)
        word_family_count:      wordFamilyReport.uniqueFamilies,            // unique AWL word families (RANGE signal)
        word_family_ratio:      wordFamilyReport.familyRatio,               // diversity index: uniqueFamilies / awlHits
        word_families:          wordFamilyReport.families,                  // list of stems for debug
        advanced_vocab_count:   advancedVocabSet.size + collocationsSet.size,
        advanced_words:         Array.from(advancedVocabSet),
        less_common_words:      Array.from(lessCommonVocabSet),
        collocations_count:     collocationsSet.size,
        collocations:           Array.from(collocationsSet),
        // Register analysis — feeds ScoringEngine._computeLR() register penalty
        register_severity:      registerReport.severity,      // NONE | LOW | MEDIUM | HIGH
        register_density:       registerReport.density,       // weighted hits per 100 words
        register_detected:      registerReport.detected,      // [{term, tier, frequency}]
        // Phase 2 — Collocation Embedding Similarity (populated by writing.service.js after parallel block)
        collocation_similarity_score: null,  // 5.0–7.5 from CollocationEmbeddingService
        collocation_density:          null,  // ratio of academic chunks
        collocation_hits_high:        0,     // C1/C2 cosine hits
        collocation_hits_mid:         0,     // B2 cosine hits
        top_collocations_embedding:   [],    // detected academic chunks (for prompt)
      },
      cohesion: {
        total_linking_words: totalLinkingWords,
        overused: overused_linking_words,
        // Cliché & template phrase analysis (used by BandConstraintEngine and LLM prompt)
        cliche_total: clicheReport.total,
        cliche_density: clicheReport.density,
        cliche_detected: clicheReport.detected,
        cliche_counts_by_tier: clicheReport.counts,
        has_mechanical_transitions: clicheReport.has_mechanical_transitions
      },
      discourse: {
        counts: discourseCounts
      },
      // Phase 2 — Discourse Graph (populated by writing.service.js after parallel block)
      discourse_graph: {
        graph_cc_score: null,  // null until DiscourseGraphService runs
        graph_reasons:  [],
        graph_stats:    {},
        nodes:          [],
        edges:          [],
      },

    };

    return { feature_map, annotations };
  }
}

module.exports = new FeatureBuilder();
