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
    const advancedStructureGlobalSet = new Set(); // NEW
    const linkingWordCounts = {};
    let totalLinkingWords = 0;
    
    let advancedVocabSet = new Set();
    const annotations = [];

    for (let i = 0; i < totalSentences; i++) {
      const mRes = microResults[i] || { errors: [], is_error_free: true, sentence: "" };
      const rRes = ruleResults[i] || { type: "simple", word_count: 0, linking_words: [], academic_words: [], is_fragment: false, sentence: "" };
      
      const sentence = mRes.sentence || rRes.sentence;
      totalWords += (rRes.word_count || sentence.split(/\s+/).length);
      
      // Structure Stats
      if (rRes.is_fragment) structureCounts.fragment++;
      else if (rRes.type) structureCounts[rRes.type] = (structureCounts[rRes.type] || 0) + 1;
      
      // Advanced Grammar Structures Stats (NEW)
      if (rRes.advanced_structures) {
        rRes.advanced_structures.forEach(struct => advancedStructureGlobalSet.add(struct));
      }
      
      // Linking Words Stats
      if (rRes.linking_words) {
        for (const lw of rRes.linking_words) {
          totalLinkingWords++;
          const word = lw.word.toLowerCase();
          linkingWordCounts[word] = (linkingWordCounts[word] || 0) + 1;
        }
      }

      // Academic Vocab Stats
      if (rRes.academic_words) {
        for (const aw of rRes.academic_words) {
          advancedVocabSet.add(aw.toLowerCase());
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

    // Paragraph count & TTR
    const paragraphs = ruleBasedService.splitParagraphs(fullEssayText);
    const ttr = ruleBasedService.calculateTTR(fullEssayText);

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
        advanced_structure_count: advancedStructureGlobalSet.size, // NEW
        advanced_structures: Array.from(advancedStructureGlobalSet) // NEW
      },
      lexical_resource: {
        type_token_ratio: parseFloat(ttr.toFixed(3)),
        advanced_vocab_count: advancedVocabSet.size,
        advanced_words: Array.from(advancedVocabSet)
      },
      cohesion: {
        total_linking_words: totalLinkingWords,
        overused: overused_linking_words
      }
    };

    return { feature_map, annotations };
  }
}

module.exports = new FeatureBuilder();
