# Complex Structures: Advanced Linguistic Weapons for Band 7.0-9.0

## 1. Overview
Advanced structures demonstrate a candidate's ability to manipulate English grammar to express nuanced ideas. AI should prioritize these structures when awarding scores for **Grammatical Range and Accuracy (GRA)**.

## 2. Core Advanced Structures

### A. Passive Voice (Câu bị động)
* **Purpose:** Shifting focus from the "doer" to the "action" or the "receiver." Highly essential for Academic Task 1 (Processes) and formal Task 2.
* **Pattern:** `[Object] + [be] + [Past Participle] (+ by Agent)`
* **AI Logic:** Reward when used to maintain objective tone (e.g., "It is widely believed that..." instead of "I think...").

### B. Conditionals (Câu điều kiện)
* **Level 2 (Hypothetical):** `If + S + V-past, S + would + V-inf.`
* **Level 3 (Past Regret):** `If + S + had + V3, S + would + have + V3.`
* **Mixed Conditionals:** Combining past cause with present effect.
* **AI Logic:** Identify "If" clauses and verify tense consistency. High rewards for Level 3 and Mixed.

### C. Relative Clauses (Mệnh đề quan hệ)
* **Defining:** Essential to the meaning (e.g., "People **who** live in cities...").
* **Non-defining:** Adding extra info with commas (e.g., "The Internet, **which** was invented in...").
* **Reduced Relative Clauses:** "The ideas **presented** in the book..." (instead of "which were presented").
* **AI Logic:** Detecting relative pronouns (*who, whom, which, that, whose*) and punctuation for non-defining clauses.

### D. Inversion (Đảo ngữ)
* **Purpose:** Emphasizing a point; typically for Band 8.0+.
* **Common Patterns:**
    * `Not only... but also...` -> "Not only **is it** expensive, but..."
    * `Under no circumstances` / `Never before` -> "Never before **have we** faced..."
* **AI Logic:** Detect negative adverbials at the start of a sentence followed by auxiliary verbs before the subject.

### E. Nominalization (Danh từ hóa)
* **Definition:** Turning verbs or adjectives into nouns to make the writing more academic and concise.
* **Example:** * *Verb:* "The climate **changed** rapidly."
    * *Nominalized:* "The **rapid change** in climate led to..."
* **AI Logic:** Measure the density of abstract nouns vs. action verbs. High nominalization = Higher academic register.

---

## 3. Scoring Impact (GRA Criteria)

| Band | Performance Characteristics |
| :--- | :--- |
| **9.0** | Uses a wide range of advanced structures naturally. Errors are extremely rare ("slips"). |
| **8.0** | Uses a wide range of structures. Majority of sentences are error-free. |
| **7.0** | Uses a variety of complex structures. Some errors may persist but do not impede communication. |
| **5.0** | Limited to simple patterns. Attempted complex structures are often inaccurate. |

---

## 4. RAG & AI Implementation Tags

* **Node Types:** `Passive_Construction`, `Inversion_Marker`, `Condition_Clause`.
* **Property:** `complexity_weight` (Inversion: 5, Passive: 2, Mixed_Conditional: 4).
* **Graph Logic:** * If a sentence uses `Inversion` + `Complex_Vocab`, assign high `Grammar_Sophistication_Score`.
    * Track the ratio of `Passive` vs. `Active` nodes in Academic Task 1.

---

## 5. Training Mode: "Weapon" Upgrade Examples

| Basic Sentence (Band 5.0) | Advanced Upgrade (Band 7.5+) | Structure Used |
| :--- | :--- | :--- |
| People cut down trees, so the earth gets hotter. | If forests **were not cleared** so extensively, global temperatures **would not rise** so rapidly. | **Passive + Conditional L2** |
| Technology is good, and it is also cheap. | **Not only is** technology beneficial, **but** it has also become increasingly affordable. | **Inversion** |
| The population increased. This caused problems. | The **rapid increase** in population has resulted in numerous social issues. | **Nominalization** |