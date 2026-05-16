# Task Response Scoring Logic: Content Integrity and Requirement Fulfillment

## 1. Overview
Task Response (TR) evaluates how well the candidate addresses the prompt, maintains a consistent position, and develops their ideas. This module provides the quantitative framework for the AI to convert qualitative descriptors into a numerical Band Score.

## 2. Key Performance Metrics (The Scoring Engine)
The AI assesses TR based on four distinct behavioral metrics:

| Metric | Code | Definition |
| :--- | :--- | :--- |
| **Coverage Ratio** | `CR` | Percentage of prompt instructions addressed (e.g., both sides of a discussion). |
| **Stance Continuity** | `SC` | Consistency of the author's opinion from Introduction to Conclusion. |
| **Development Depth** | `DD` | The average depth of the argument chain (Main Idea -> Explanation -> Example). |
| **Relevance Index** | `RI` | The ratio of core-relevant content vs. tangential/off-topic drift. |

## 3. Band Descriptor Thresholds

| Band | Threshold Criteria | Qualitative Assessment |
| :--- | :--- | :--- |
| **9.0** | CR: 100%, SC: 1.0, DD > 3.0 | Fully addresses all parts of the task with a fully developed response. |
| **8.0** | CR: 100%, SC: 0.9, DD > 2.5 | Sufficiently addresses all parts; ideas are consistently well-supported. |
| **7.0** | CR: 100%, SC: > 0.8, DD > 2.0 | **Addresses all parts of the task. Presents a clear position throughout.** |
| **6.0** | CR: > 75%, SC: > 0.6, DD > 1.5 | **Addresses all parts, though some may be more fully covered than others.** |
| **5.0** | CR: < 50% OR SC: < 0.5 | **Addresses the task only partially; the position may be unclear.** |

---

## 4. Penalty and Hard-Cap Rules
To mimic an IELTS examiner, the AI must apply "Hard Caps" when critical requirements are missed.

### A. The "Incomplete Response" Cap
* **Trigger:** `CR < 100%` (e.g., student missed a sub-question or only discussed one side of a "Discuss Both Views" prompt).
* **Action:** **Hard cap TR at Band 5.0.** ### B. The "Irrelevant Content" Penalty
* **Trigger:** `RI < 60%`.
* **Action:** Deduct **1.0 to 2.0 Bands** depending on the severity of the semantic drift.

### C. The "Position Flip" Warning
* **Trigger:** Significant variance between `Thesis_Node` sentiment and `Conclusion_Node` sentiment.
* **Action:** Cap TR at **Band 5.5** (Position is considered "unclear" or "inconsistent").

---

## 5. RAG & Graph Logic Integration

* **Step 1:** The AI maps all `Argument_Nodes` to the corresponding `Prompt_Requirement_Nodes`.
* **Step 2:** Calculate **Graph Density** for each body paragraph. High density + deep branching = High `DD` score.
* **Step 3:** Use **Stance Vectors** to track the flow of the argument across the `Essay_Graph`.

---

## 6. Implementation Strategy for Hiếu

1. **Requirement Checkboxes:** The Backend should generate a dynamic checklist based on the `instruction_type` (e.g., if "Discuss Both Views", checklist = [Side_A, Side_B, Opinion]).
2. **Path Depth Calculation:**
   * `MATCH (p:Paragraph)-[:CONTAINS]->(m:MainIdea)`
   * `OPTIONAL MATCH path = (m)<-[:EXPLAINS|EXEMPLIFIES*1..3]-(s)`
   * `RETURN avg(length(path)) as DD`
3. **Weighting Formula:** `Base_TR = (CR * 0.4) + (SC * 0.3) + (DD * 0.3)`. Apply penalties to this base value.

---

## 7. Feedback Generation Strategy

* **If Band 5.0:** "You missed a key part of the question (Requirement X). To improve, ensure you address every instruction in the prompt."
* **If Band 6.0:** "Your ideas are relevant, but some are 'listed' rather than 'developed'. Try to explain 'Why' or 'How' for every main point you make."
* **If Band 7.0+:** "Well-rounded response. You maintained a clear stance and supported your views with specific evidence."


## 8. Metadata
* **Domain:** Task_Response
* **Focus:** Requirement_Coverage, Argumentation_Logic, Band_Mapping
* **Relationship:** Anchors_all_Content_Nodes