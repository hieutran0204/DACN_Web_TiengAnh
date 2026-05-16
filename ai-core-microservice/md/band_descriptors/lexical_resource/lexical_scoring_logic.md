# Lexical Scoring Logic: Measuring Vocabulary Range and Precision

## 1. Overview
This module defines the algorithmic approach to scoring the **Lexical Resource (LR)** criterion. It distinguishes between Band 6.0 (Attempted Complexity) and Band 7.0+ (Successful Precision) by analyzing the density of "Less Common Lexical Items" (LCLIs) and the accuracy of their usage.

## 2. Quantifying Lexical Performance

AI calculates the **Lexical Sophistication Index (LSI)** based on the distribution of word tiers:
* **LCLI Density:** The percentage of Tier 2 & Tier 3 words relative to total content words.
* **Precision Rate:** The ratio of correct collocations/usage vs. total attempts at advanced vocabulary.

| Band | Lexical Sophistication Index (LSI) | Qualitative Criteria (IELTS Standards) |
| :--- | :--- | :--- |
| **9.0** | > 35% LCLI + 98% Precision | Uses a wide range of vocabulary with very natural and sophisticated control. |
| **8.0** | 25% - 34% LCLI + 90% Precision | Skillfully uses uncommon lexical items; occasional inaccuracies in word choice. |
| **7.0** | 15% - 24% LCLI + 75% Precision | **Uses less common lexical items with some awareness of style and collocation.** |
| **6.0** | 10% - 14% LCLI + < 60% Precision | **Attempts to use LCLIs but with some inaccuracy** (wrong context/collocation). |
| **5.0** | < 10% LCLI | Relies on high-frequency (Tier 1) words; range is insufficient for the task. |

---

## 3. The "Attempt vs. Success" Logic

In GraphRAG, the AI evaluates "Attempts" by checking the relationship between a `Lexical_Unit` and its `Context_Node`.

### A. The Band 6.0 Pattern (Attempted)
* **Detection:** The AI identifies a Tier 2 or Tier 3 word (LCLI), but the `COLLOCATES_WITH` edge to the surrounding words has a low probability score.
* **Tag:** `[LEXICAL_ATTEMPT_INACCURATE]`
* **Feedback:** "You tried to use a high-level word '{word}', but it doesn't fit naturally with '{neighbor_word}'."

### B. The Band 7.0 Pattern (Awareness)
* **Detection:** The AI identifies LCLIs used with high-probability `Collocation_Edges`.
* **Tag:** `[SUCCESSFUL_LCLI_USAGE]`
* **Feedback:** "Great use of '{collocation}'! This advanced phrasing helps push your score toward Band 7.0+."

---

## 4. Scoring Penalties & Bonuses

### A. Penalties (Deductions)
* **Repetitive Basic Vocabulary:** If the same Tier 1 adjective/verb is used > 4 times (e.g., "very good", "important").
* **Slang/Informal Register:** Deduct points for "kids", "stuff", "cool" in an academic context.
* **Systemic Spelling Errors:** If the same word is misspelled multiple times, indicating a lack of knowledge.

### B. Bonuses (Extra Points)
* **Topic-Specific Terminology:** Using words deeply linked to the prompt's domain (e.g., 'biodiversity' for Environment).
* **Precise Nominalization:** Converting "verbs" into "abstract nouns" to increase academic density.

---

## 5. Implementation Strategy for Hiếu

1. **LCLI Extraction:** AI parses the essay and tags words based on the `vocabulary_range.md` tiers.
2. **Collocation Validation:** For every Tier 2/3 word, the AI queries the `collocations_idioms.md` graph. 
   * If the pairing exists -> **High Precision.**
   * If the pairing is non-existent/unnatural -> **Attempted but Inaccurate.**
3. **Dynamic Band Adjustment:** * Start at Band 6.0 if LCLIs are present.
   * Upgrade to Band 7.0 if the **Precision Rate** > 75%.
   * Downgrade to Band 5.0 if LCLI density is below 10%.

---

## 6. RAG Metadata
* **Domain:** Lexical_Resource
* **Focus:** Precision_vs_Attempt, Register_Consistency, LCLI_Density
* **Graph Logic:** * `(Essay_Node) --[HAS_DENSITY]--> (Value)`
    * `(LCLI_Node) --[USED_IN_CONTEXT]--> (Accuracy_Status)`