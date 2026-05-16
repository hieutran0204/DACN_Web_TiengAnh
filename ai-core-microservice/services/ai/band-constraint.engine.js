/**
 * Phase 2.5: Band Constraint Engine
 * 
 * Calculates Hard Caps (maximum possible score) for each criterion based on
 * rigid IELTS marking rules, overriding any LLM "generosity".
 */
class BandConstraintEngine {
  
  calculateCaps(featureMap) {
    const caps = {
      task_response: 9.0,
      coherence_cohesion: 9.0,
      lexical_resource: 9.0,
      grammatical_range_accuracy: 9.0,
      reasons: []
    };

    const words = featureMap.sentence_structure.total_words;
    const paragraphs = featureMap.sentence_structure.paragraph_count;
    const advancedVocab = featureMap.lexical_resource.advanced_vocab_count;
    const ttr = featureMap.lexical_resource.type_token_ratio;
    const majorErrors = featureMap.grammar.severity_breakdown.major;
    const errorDensity = featureMap.grammar.error_density;
    const fragments = featureMap.sentence_structure.fragments;
    const complexRatio = featureMap.sentence_structure.complex / featureMap.sentence_structure.total_sentences; // NEW
    const advStructCount = featureMap.sentence_structure.advanced_structure_count; // NEW

    // 1. Task Response (TR) Caps
    if (words < 100) {
      caps.task_response = Math.min(caps.task_response, 4.0);
      caps.reasons.push("Task Response capped at 4.0: Essay is severely underlength (< 100 words).");
    } else if (words < 250) {
      caps.task_response = Math.min(caps.task_response, 5.0);
      caps.reasons.push("Task Response capped at 5.0: Essay is under the standard 250 words, indicating insufficient development.");
    }

    if (paragraphs === 1) {
      caps.task_response = Math.min(caps.task_response, 5.0);
      caps.reasons.push("Task Response capped at 5.0: No paragraphing format used.");
    }

    // 2. Coherence & Cohesion (CC) Caps
    if (paragraphs === 1) {
      caps.coherence_cohesion = Math.min(caps.coherence_cohesion, 4.0);
      caps.reasons.push("Coherence & Cohesion capped at 4.0: Entire essay is a single block of text (no paragraphing).");
    }
    
    if (fragments > 1) {
      caps.coherence_cohesion = Math.min(caps.coherence_cohesion, 5.0);
      caps.reasons.push("Coherence & Cohesion capped at 5.0: Multiple sentence fragments disrupt logical progression.");
    }

    // 3. Lexical Resource (LR) Caps
    if (advancedVocab === 0 || ttr < 0.4) {
      caps.lexical_resource = Math.min(caps.lexical_resource, 5.0);
      caps.reasons.push("Lexical Resource capped at 5.0: Very basic vocabulary used, with low variety (TTR < 0.4) and no academic words.");
    } else if (advancedVocab < 3 || ttr < 0.5) {
      caps.lexical_resource = Math.min(caps.lexical_resource, 6.0);
      caps.reasons.push("Lexical Resource capped at 6.0: Limited use of advanced vocabulary.");
    }

    // 4. Grammatical Range & Accuracy (GRA) Caps
    
    // --- ACCURACY CAPS (OLD LOGIC COMMENTED) ---
    /*
    if (errorDensity > 0.1) {
      caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 4.0);
      caps.reasons.push("Grammatical Range & Accuracy capped at 4.0: Very high error density (>10%).");
    } else if (majorErrors >= 3) {
      caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 5.0);
      caps.reasons.push(`Grammatical Range & Accuracy capped at 5.0: Frequent major errors (${majorErrors}).`);
    } else if (majorErrors >= 1 || errorDensity > 0.05) {
      caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 6.0);
      caps.reasons.push("Grammatical Range & Accuracy capped at 6.0: Some major errors.");
    }
    */

    // --- NEW LOGIC: Hybrid Accuracy + Range ---
    
    // Check Accuracy first
    if (errorDensity > 0.1) {
      caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 4.0);
      caps.reasons.push("GRA capped at 4.0: Too many errors (>10% density).");
    } else if (majorErrors >= 3) {
      caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 5.0);
      caps.reasons.push("GRA capped at 5.0: Frequent major errors.");
    }

    // Check Range (The "Wow" factor)
    if (complexRatio < 0.2 && advStructCount === 0) {
      caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 5.0);
      caps.reasons.push("GRA capped at 5.0: Only simple sentences used. No advanced structures detected.");
    } else if (complexRatio < 0.4 && advStructCount < 2) {
      caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 6.0);
      caps.reasons.push("GRA capped at 6.0: Limited variety of complex structures.");
    } else if (advStructCount < 3) {
      // To get Band 7.0+, you need at least 3 types of advanced structures (e.g. Passive, Relative, Conditional)
      caps.grammatical_range_accuracy = Math.min(caps.grammatical_range_accuracy, 7.0);
      if (caps.grammatical_range_accuracy === 7.0) {
        caps.reasons.push("GRA capped at 7.0: More variety of advanced structures needed for Band 8+.");
      }
    }

    return caps;
  }
}

module.exports = new BandConstraintEngine();
