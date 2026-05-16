# Cohesion: Linguistic Connectivity and Transitioning

## 1. Definition
Cohesion refers to the visible "linguistic bridges" between sentences and paragraphs. While Coherence focuses on the logic of ideas, **Cohesion** focuses on the grammatical and lexical tools used to bind the text together.

## 2. Key Cohesive Mechanisms

### A. Grammatical Cohesion
* **Reference:** Using pronouns (*it, they, these, those*) or articles (*the*) to refer back to previously mentioned entities.
* **Substitution:** Replacing a word or phrase with a filler word like "one," "do," or "so" to avoid repetition.
    * *Example:* "Many students prefer tablets, but some older **ones** still use notebooks."
* **Ellipsis:** Omitting words that are understood from context.
    * *Example:* "John can play the piano, and Mary [can play] the violin."

### B. Lexical Cohesion
* **Reiteration:** Repeating a key term or using synonyms, hyponyms (specifics), or superordinates (generals) to maintain a thematic thread.
    * *Chain example:* "Pollution" -> "Contamination" -> "Environmental degradation."
* **Collocation:** Using words that naturally go together to create a sense of unity.
    * *Example:* "Heavy rain," "Climate change," "Mitigate risk."

### C. Conjunctive Cohesion (Linkers)
* **Additive:** *Furthermore, Moreover, Additionally.*
* **Adversative (Contrast):** *However, Nevertheless, Conversely.*
* **Causal:** *Consequently, Therefore, Thus.*
* **Sequential:** *Firstly, Subsequently, Finally.*

---

## 3. Band Descriptor Markers for Cohesion

| Band | Performance Characteristics |
| :--- | :--- |
| **9.0** | Cohesion is seamless; used in such a way that it attracts no attention. |
| **7.0** | Range of cohesive devices used with flexibility; some over/under-use may occur. |
| **5.0** | Relies on basic linkers (*and, but*); cohesive devices are repetitive or mechanical. |

---

## 4. Error Identification for AI Scoring

### A. Mechanical Linking
* **Signal:** Every sentence starts with a formal transition word (e.g., *Firstly... Secondly... In addition...*).
* **AI Tag:** `[ERROR_MECHANICAL_COHESION]`
* **Impact:** Limits score to Band 6.0 even if logic is sound.

### B. Ambiguous Referencing
* **Signal:** Use of "this," "it," or "they" when there are multiple possible antecedents.
* **Example:** "The government built schools for children because **they** were poor." (Who was poor? The schools or the children?).
* **AI Tag:** `[ERROR_AMBIGUOUS_REF]`

### C. Under-use of Cohesion
* **Signal:** Short, "choppy" sentences with no connection, making the text feel like a list of facts.

---

## 5. RAG Implementation Metadata

* **Domain:** IELTS Writing
* **Focus:** Linguistic_Linkage, Referencing_Systems, Lexical_Chains
* **Relationship:** Complements_Coherence, Intersects_with_Grammar
* **Graph_Logic:**
    * **Nodes:** `Cohesive_Device`, `Entity_Antecedent`, `Anaphoric_Pronoun`.
    * **Edges:** `REFERS_TO`, `CONTRASTS_WITH`, `EXPANDS_UPON`.
* **Detection_Metric:** Cohesive density (Ratio of linkers to total sentences) and Linker Diversity Index.

---

## 6. Training Mode: Few-Shot Examples

**❌ Bad Cohesion (Band 5.0):**
> Many people like city life. City life is noisy. City life is expensive. **But** cities have jobs. **So** people stay there.

**✅ Good Cohesion (Band 7.5+):**
> Although urban environments are often characterized by noise and high living costs, **they** offer abundant employment opportunities. **Consequently**, many individuals choose to remain in metropolitan areas despite **these** drawbacks.