# Sentence Variety: Syntactic Complexity and Range

## 1. Definition
Sentence variety refers to the strategic use of different sentence structures to convey meaning clearly and engage the reader. In IELTS, a mix of simple and complex structures is mandatory for **Band 7.0+**.

## 2. Sentence Classification (The Logic Engine)

### A. Simple Sentences (Câu đơn)
* **Structure:** One independent clause (Subject + Verb).
* **Example:** "Technology has changed the world."
* **AI Metric:** If frequency > 60%, flag `[LOW_SYNTACTIC_VARIETY]`.

### B. Compound Sentences (Câu ghép)
* **Structure:** Two independent clauses joined by a coordinating conjunction (**FANBOYS**: *For, And, Nor, But, Or, Yet, So*).
* **Example:** "Governments should invest in schools, **and** they should also support teachers."
* **AI Logic:** Detect FANBOYS with a comma before them linking two full clauses.

### C. Complex Sentences (Câu phức) - **CORE FOR BAND 7.0+**
* **Structure:** One independent clause + one or more dependent clauses (using subordinating conjunctions).
* **Types to Detect:**
    * **Contrast/Concession:** *Although, Even though, While, Whereas.*
    * **Cause/Effect:** *Because, Since, As, Inasmuch as.*
    * **Condition:** *If, Unless, Provided that.*
    * **Relative Clauses:** *Which, Who, That, Whose, Where.* (e.g., "The city **where** I live is crowded.")

### D. Compound-Complex Sentences (Câu phức hợp)
* **Structure:** At least two independent clauses and at least one dependent clause.
* **Example:** "Although it was raining, the match continued, and the fans stayed until the end."

---

## 3. Band Descriptor Markers for Grammar Range

| Band | Performance Characteristics |
| :--- | :--- |
| **9.0** | Uses a wide range of structures with full flexibility and accuracy. |
| **7.0** | Uses a variety of complex structures; often produces error-free sentences. |
| **5.0** | Uses only a limited range of structures; complex sentences are rare or faulty. |

---

## 4. Advanced Structures for Extra Points (Bonus Logic)
AI should reward the use of these "high-level" patterns:
1.  **Passive Voice:** "The project **was completed** by the team."
2.  **Inversion:** "**Not only** is it expensive, **but** it is also dangerous."
3.  **Conditional Sentences (Type 2 & 3):** "If the government **had acted** sooner, the crisis **could have been** avoided."
4.  **Participle Phrases:** "**Having finished** the report, the manager called a meeting."

---

## 5. RAG & AI Detection Logic

* **Node:** `Sentence_Node`.
* **Property:** `structure_type` (Simple, Compound, Complex, Compound-Complex), `is_passive` (Boolean), `clause_count`.
* **Scoring Formula (Simplified):**
    * `Score = (Complex_Count / Total_Sentences) * Weight + (Variety_Index)`.
* **Instruction:** "If the user writes 3 simple sentences in a row, suggest combining them into a complex sentence using a subordinator (e.g., although, because)."

---

## 6. Training Mode: Transformation Examples

**❌ Band 5.0 (Choppy/Simple):**
> Tourism brings money. It also creates jobs. But it destroys nature. Many animals lose their homes.

**✅ Band 7.5+ (Varied/Complex):**
> While tourism undoubtedly brings financial benefits and creates employment opportunities, it often leads to the destruction of natural habitats, **which** causes many animals to lose their homes.