# Position Consistency: Argumentative Integrity and Flow

## 1. Overview
A "Clear Position" is a mandatory requirement for **Band 7.0+** in Task Response. The AI must verify that the writer’s opinion remains consistent from the **Introduction (Thesis Statement)** through the **Body Paragraphs** to the **Conclusion**.

## 2. Logical Anchor Points
The AI monitors the writer's stance at three critical junctures:

### A. The Thesis Statement (Introduction)
* **Goal:** Identify the primary stance (Agree, Disagree, or Balanced).
* **AI Logic:** Extract the `Opinion_Entity` and its `Polarity` (e.g., `Stance: Positive`, `Intensity: 0.8`).

### B. Body Paragraph Support
* **Goal:** Ensure each paragraph's `Topic Sentence` reinforces the Thesis.
* **AI Logic:** Check if the arguments presented are "Supportive" or "Counter" to the initial stance.
* **Warning:** If a writer provides a counter-argument without a clear "Rebuttal" (phản biện), the AI marks the position as "Blurred."

### C. The Conclusion (Restatement)
* **Goal:** Match the final judgment with the initial Thesis.
* **AI Logic:** Compare the `Sentiment_Vector` of the Conclusion with the Introduction.

---

## 3. Position Conflict Detection (The "Flip-Flop" Logic)

AI performs a **Stance Mapping** across the essay nodes.

| Pattern Found | AI Diagnosis | TR Band Impact |
| :--- | :--- | :--- |
| Intro: Agree | Body: Agree | Conclusion: Agree | **Consistent** | **7.0 - 9.0** |
| Intro: Agree | Body: Mixed | Conclusion: Agree | **Clear (with concession)** | **7.0 - 8.0** |
| Intro: Agree | Body: Disagree | Conclusion: Agree | **Inconsistent Argument** | **5.0 - 6.0** |
| Intro: Neutral | Body: Mixed | Conclusion: No Opinion | **No Clear Position** | **5.0** |

---

## 4. RAG & Graph Logic: The "Stance Edge"

* **Node Type:** `Thesis_Node`, `Conclusion_Node`, `Argument_Node`.
* **Property:** `stance_polarity` (-1.0 to 1.0), `logical_weight`.
* **Graph Logic:**
    * Create an edge `[:REINFORCES]` or `[:CONTRADICTS]` between `Argument_Node` and `Thesis_Node`.
    * If `COUNT(CONTRADICTS)` > `COUNT(REINFORCES)` while Thesis is Positive -> Trigger `[LOGICAL_INCONSISTENCY_FLAG]`.

---

## 5. Implementation Strategy for Hiếu

1. **Thesis Extraction:** Use an LLM to identify the specific sentence in the Intro that contains the opinion and convert it into a **Stance Vector**.
2. **Sentiment Alignment:** Throughout the essay, use Sentiment Analysis to track if the tone remains aligned with the Thesis.
3. **Conclusion Matching:** * *Query:* `MATCH (i:Intro_Stance), (c:Conclusion_Stance) WHERE distance(i.vector, c.vector) > Threshold RETURN 'Inconsistent'`
4. **Counter-Argument Check:** Identify words like *"However"*, *"Admittedly"*, or *"While it is true that..."* to see if the user is purposefully presenting a counter-view (which is good) or just being confused (which is bad).

---

## 6. Training Mode: Consistency Examples

**❌ Inconsistent (Band 5.0):**
* **Intro:** "I completely agree that computers should replace teachers."
* **Body 1:** "Computers are fast and efficient."
* **Body 2:** "However, teachers are better because they have emotions."
* **Conclusion:** "In conclusion, humans are better than machines."
* **AI Feedback:** "Your opinion shifted from Agreeing in the intro to Disagreeing in the conclusion. This makes your position unclear."

**✅ Consistent (Band 7.5+):**
* **Intro:** "I strongly believe technology is a benefit, although it has minor drawbacks."
* **Body 1:** "Technology improves efficiency..."
* **Body 2:** "Admittedly, privacy is an issue; however, this can be managed with better laws."
* **Conclusion:** "Despite some concerns, the advantages clearly outweigh the disadvantages."
* **AI Feedback:** "Your position is maintained throughout the essay, even when addressing counter-arguments."

---

## 7. Metadata
* **Domain:** Task_Response
* **Focus:** Logical_Consistency, Opinion_Tracking, Argument_Integrity
* **Relationship:** Intersects_with_Coherence (Logic Flow)