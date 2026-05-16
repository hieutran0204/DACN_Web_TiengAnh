# Collocations and Idiomatic Expressions: Lexical Precision Guide

## 1. Definition
* **Collocations:** Words that naturally go together. Using the wrong combination makes the writing sound "unnatural" to native speakers.
* **Idiomatic Expressions:** Phrases whose meaning cannot be deduced from individual words. (Note: In Task 2, these must remain **Formal/Academic**, not slang).

## 2. Collocation Framework (The Pairings)

AI should detect the strength of connection between words based on these patterns:

### A. Verb + Noun (The Most Common)
* **Standard:** Solve a problem, Reduce risk, Give an opinion.
* **Advanced (Band 7.0+):** `Address/Tackle an issue`, `Mitigate/Alleviate risk`, `Voice an opinion`.
* **AI Logic:** If the user uses a weak/common verb, suggest an advanced collocate.

### B. Adjective + Noun
* **Standard:** Big change, Fast growth, Bad effect.
* **Advanced (Band 7.0+):** `Sweeping/Radical change`, `Exponential growth`, `Adverse/Detrimental effect`.

### C. Adverb + Adjective
* **Standard:** Very important, Really happy.
* **Advanced (Band 7.0+):** `Crucially important`, `Ecstatically happy`, `Deeply concerned`.

---

## 3. Academic Idiomatic Expressions
*Warning: AI must flag "Slang" or "Informal Idioms" (e.g., "Piece of cake", "Raining cats and dogs") as errors in Task 2.*

| Academic Idiom | Meaning | Example in Task 2 |
| :--- | :--- | :--- |
| **A double-edged sword** | Has both pros and cons | "Technological progress is a double-edged sword." |
| **The lion’s share** | The majority of something | "The lion's share of the budget is spent on health." |
| **Play a pivotal role** | To be very important | "Education plays a pivotal role in poverty reduction." |
| **A bone of contention** | A subject of disagreement | "The tax policy remains a bone of contention." |

---

## 4. Error Identification: Lexical Mis-collocation

AI sẽ trích xuất các cụm (n-grams) và đối chiếu với **Collocation Map**:

* **Pattern:** `Verb(X) + Noun(Y)`
* **❌ Error (L1 Interference):** "Make a homework" (Ảnh hưởng từ tiếng Việt: "Làm bài tập").
* **✅ Correct:** "Do homework".
* **❌ Error:** "Broaden my eyes" (Ảnh hưởng từ: "Mở mang tầm mắt").
* **✅ Correct:** "Broaden my horizons" or "Open my mind".

---

## 5. RAG & Graph Metadata
* **Node Type:** `Collocation_Pair`, `Idiom_Entity`.
* **Properties:** `usage_count`, `strength_index` (0-1), `is_formal` (Boolean).
* **Graph Logic:** * `(Word_A) --[COLLOCATES_WITH {strength: 0.9}]--> (Word_B)`.
    * Nếu `strength` < 0.2 (ví dụ: "Heavy rain" là 0.9, "Strong rain" là 0.1) -> AI gắn nhãn `[UNNATURAL_PHRASING]`.

---

## 6. Implementation Strategy for Hiếu (The "Cluster" Approach)

1. **Extraction:** AI không chỉ trích xuất từ đơn mà phải trích xuất các **Bigrams** (2 từ) và **Trigrams** (3 từ).
2. **Scoring:** * Nếu bài viết chứa > 5 cụm **Advanced Collocations** -> Cộng điểm Lexical Resource.
    * Nếu chứa **Informal Idioms** -> Trừ điểm "Register/Style".
3. **Feedback:** "Bạn dùng 'reduce risk', cụm này đúng nhưng hơi đơn giản. Trong ngữ cảnh học thuật, dùng 'mitigate risk' sẽ giúp tăng Band điểm vựng của bạn lên 7.5+ đó."

---

## 7. Metadata
* **Domain:** Lexical_Resource, Style_and_Register
* **Focus:** Word_Pairings, Academic_Tone, Precision
* **Relationship:** Supports_Vocabulary_Range, Intersects_with_Accuracy