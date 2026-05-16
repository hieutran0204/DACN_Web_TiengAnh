# Vocabulary Range: Lexical Density and Sophistication

## 1. Overview
Lexical Resource measures the range of vocabulary used and the precision with which it is applied. For **Band 7.0+**, the user must demonstrate the use of "Less Common Lexical Items" (LCLIs) and avoid over-reliance on "Common" words.

## 2. Lexical Classification (The Tiers)

### Tier 1: Common Lexical Items (Band 5.0 - 6.0)
* **Characteristics:** Generic, high-frequency words used in daily conversation.
* **Examples:** *Good, Bad, Big, Small, Happy, Sad, Thing, People, Say, Think.*
* **AI Logic:** If the density of Tier 1 words > 80%, flag `[LOW_LEXICAL_VARIETY]`.

### Tier 2: Academic & Topic-Specific (Band 7.0)
* **Characteristics:** Words that are more precise and formal.
* **Examples:** *Beneficial, Detrimental, Substantial, Minimal, Contented, Regressive, Element, Citizens, State, Contemplate.*

### Tier 3: Less Common Lexical Items (LCLIs) (Band 8.0+)
* **Characteristics:** Sophisticated vocabulary, idiomatic expressions (used naturally), and rare collocations.
* **Examples:** *Invaluable, Pernicious, Monumental, Infinitesimal, Euphoric, Melancholy, Nuance, Denizens, Assert, Postulate.*

## 3. Scoring Metrics (The Logic Engine)

AI will calculate the **Advanced Vocabulary Ratio (AVR)**:
$$AVR = \frac{\text{Count of (Tier 2 + Tier 3 words)}}{\text{Total Content Words}} \times 100\%$$

| Band | AVR Threshold | Description |
| :--- | :--- | :--- |
| **9.0** | > 35% | Uses a wide range of vocabulary with very natural and sophisticated control. |
| **7.0** | 20% - 34% | **Uses less common lexical items** with some awareness of style and collocation. |
| **5.0** | < 10% | Uses only limited range of vocabulary; relies on repetitive, basic words. |

## 4. Repetition & Synonym Suggestion Logic
If the AI detects the same Tier 1 word repeated $> 3$ times, it triggers the **Synonym Node** in the Knowledge Graph.

* **Trigger:** `Repeated_Word("important")`
* **Knowledge Graph Search:** `(important) --[SYNONYM_OF]--> (crucial, essential, pivotal, vital)`
* **Recommendation:** "Bạn đang dùng từ 'important' quá nhiều. Hãy thử thay bằng 'pivotal' hoặc 'essential' để tăng band điểm."

---

## 5. RAG & Graph Metadata
* **Node Type:** `Lexical_Unit`
* **Properties:** `tier_level` (1, 2, 3), `topic_domain` (Education, Health, Environment), `is_academic` (Boolean).
* **Graph Logic:** * `(Sentence_Node) --[CONTAINS]--> (Lexical_Unit)`
    * AI analyzes the "Average Tier Score" of all `Lexical_Unit` nodes connected to the `Essay_Node`.

---

## 6. Training Mode: Lexical Upgrades

| Common (Band 5.0) | Advanced (Band 7.5+) | Context/Domain |
| :--- | :--- | :--- |
| Many / A lot of | A vast array of / A multitude of | General |
| Solve a problem | Mitigate an issue / Tackle a challenge | Problem-solving |
| Change (n) | Transformation / Alteration | General |
| Rich countries | Developed nations / Wealthy economies | Economy |
| School / Study | Educational institutions / Academic pursuit | Education |

---

## 7. Implementation Strategy for Hiếu (Entity-Based)
1. **Extraction:** AI trích xuất các `Content Words` (Noun, Verb, Adj, Adv), bỏ qua `Stop Words` (the, a, in, on).
2. **Tagging:** Gắn nhãn `tier_level` bằng cách tra cứu Database (ví dụ: Academic Word List - AWL).
3. **Collocation Check:** (Nâng cao) AI kiểm tra xem từ đó có đi với từ đứng trước/sau nó đúng không (ví dụ: *'do homework'* thay vì *'make homework'*). Nếu sai Collocation -> Trừ điểm Precision.