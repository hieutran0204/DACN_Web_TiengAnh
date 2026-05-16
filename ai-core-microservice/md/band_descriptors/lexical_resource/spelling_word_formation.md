# Spelling and Word Formation: Morphological Accuracy

## 1. Overview
Morphological accuracy evaluates the correct spelling of words and the appropriate application of word classes (Noun, Verb, Adjective, Adverb). In the IELTS context, precision in these areas is a primary indicator for **Lexical Resource** and significantly impacts **Grammatical Range and Accuracy**.

## 2. Word Formation (Morphological Transformation)
The AI utilizes **Part-of-Speech (POS) Tagging** to cross-reference the word class used by the student against the required grammatical structure of the sentence.

### A. Word Family Mapping
The system identifies variants of a root word to detect "near-miss" morphological errors.
* **Root Node:** `Success`
    * **Verb Edge:** `Succeed`
    * **Adjective Edge:** `Successful`
    * **Adverb Edge:** `Successfully`

### B. Common Word Formation Errors
* **Noun/Verb Confusion:**
    * *❌ Error:* "To **success** in life..." (Noun used instead of Verb).
    * *✅ Correct:* "To **succeed** in life..."
* **Adjective/Adverb Confusion:**
    * *❌ Error:* "The economy recovered **quick**."
    * *✅ Correct:* "The economy recovered **quickly**."
* **Invalid Derivation (Suffix Errors):**
    * *❌ Error:* "The **developation** of new apps."
    * *✅ Correct:* "The **development** of new apps."

---

## 3. Spelling Precision
The AI categorizes spelling mistakes based on their severity and impact on communicative "transparency."

### A. High-Frequency IELTS Misspellings (Target List)
The AI prioritizes scanning for "trap words" common in academic writing:
1. `Environment` (Commonly missing the 'n').
2. `Government` (Commonly missing the 'n').
3. `Accommodation` (Errors in 'c' or 'm' doubling).
4. `Necessary` (Confusion over the number of 'c's and 's's).
5. `Definitely` (Commonly misspelled as 'definately').

### B. Systematic & Stylistic Spelling
* **Regional Consistency:** The AI monitors for consistency between **American (US)** and **British (UK)** English (e.g., if *'analyze'* is used, it flags *'programme'* as an inconsistency).
* **Consonant Doubling:** Validating patterns in *Occurred, Disappointed, or Professional.*

---

## 4. RAG & Graph Logic

* **Node Types:** `Word_Family`, `Morpheme_Node`.
* **Properties:** `word_class` (Noun, Verb, etc.), `canonical_spelling`, `lemma`.
* **Graph Logic Relationships:**
    * `(Root:Success) --[:HAS_VERB_FORM]--> (Succeed)`
    * `(Root:Success) --[:HAS_ADJ_FORM]--> (Successful)`
* **Detection Engine:**
    * If the `Sentence_Node` requires a `Noun` (following a determiner like "the"), but the extracted entity is `Succeed` (Verb) -> Flag `[WORD_FORMATION_ERROR]`.

---

## 5. Band Descriptor Impact Mapping

| Band | Performance Characteristics |
| :--- | :--- |
| **9.0** | Spelling and word formation are highly accurate with only rare, non-systematic slips. |
| **7.0** | Occasional errors in spelling and/or word formation occur, but they do not impede communication. |
| **5.0** | Frequent errors in spelling and word formation; mistakes cause strain for the reader. |

---

## 6. Implementation Strategy (Morphological Reasoning)

1. **Lemmatization:** Utilize libraries like `Spacy` or `NLTK` to reduce words to their base form (Lemma) before querying the Word Family graph.
2. **Grammar-Class Validation:** Use an LLM or dependency parser to predict the required part-of-speech for a specific "slot" in a sentence. If the student’s word class contradicts the prediction -> Trigger Word Formation Error.
3. **Graph-Based Correction:** When a misspelling is detected, the AI queries the nearest `Word_Family` cluster to suggest the morphologically correct variant, rather than relying solely on string distance algorithms (Levenshtein).

---

## 7. Example for AI Feedback Engine

**❌ User Input:** "The goverment should focus on the develop of new technology."

**🤖 AI Feedback Analysis:**
* **Error 1 (Spelling):** 'goverment' -> Detected missing 'n'. 
    * *Suggestion:* 'gover**n**ment'.
* **Error 2 (Word Formation):** 'develop' identified as a Verb; however, the syntax requires a Noun following the definite article 'the'.
    * *Graph Query:* `(Root:Develop) -> Find [:HAS_NOUN_FORM] -> Result: Development`.
    * *Suggestion:* Use 'develop**ment**'.