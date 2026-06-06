# IELTS Writing Knowledge Graph (KG) Evaluation Schema

This document defines the Knowledge Graph representation and logical constraints (Band Constraints) used by the AI Evaluator to grade IELTS Writing Task 1 and Task 2. 

By mapping the official IELTS Band Descriptors into structured Graph Nodes and Rules, the AI can provide deterministic, explainable reasoning for its scoring.

---

## Part 1: Task 1 - Academic Report (Task Achievement)

### 1.1 Core Graph Nodes
To evaluate Task 1, the AI's NLP Engine will parse the student's text and extract the following logical nodes:
- `[Overview_Node]`: Sentences summarizing the main trends, differences, or stages.
- `[Key_Feature_Node]`: Data points representing the most significant elements (e.g., highest, lowest, intersection points).
- `[Data_Evidence_Node]`: The specific numbers, percentages, or figures cited from the chart.
- `[Comparison_Node]`: Linguistic structures used to compare data (e.g., "higher than", "as opposed to").

### 1.2 Band Constraint Rules (Logic Engine)
* **Band 5.0 (Penalty Ceiling):**
  * `IF [Overview_Node] IS_NULL THEN MAX_BAND = 5.0` (A clear overview is mandatory for Band 6+).
  * `IF [Data_Evidence_Node] CONTAINS (inaccurate_figures) THEN PENALIZE_BAND`.
* **Band 6.0 (Acceptable):**
  * `IF [Overview_Node] EXISTS AND [Key_Feature_Node] >= 2`
  * *Constraint:* Data may be presented mechanically, and `[Comparison_Node]` might be missing or limited.
* **Band 7.0 (Good):**
  * `IF [Overview_Node] IS_CLEAR AND [Key_Feature_Node] IS_HIGHLIGHTED_AND_SUPPORTED`
  * *Constraint:* Must contain valid `[Comparison_Node]` linking multiple variables seamlessly.
* **Band 8.0 (Excellent):**
  * `IF [Overview_Node] IS_COMPREHENSIVE AND [Data_Evidence_Node] IS_SKILFULLY_INTEGRATED`

---

## Part 2: Task 2 - Discursive Essay (Task Response)

### 2.1 Core Graph Nodes
Task 2 focuses on argumentation. The Discourse Classifier must identify:
- `[Position_Node]`: The writer's clear stance or thesis statement regarding the prompt.
- `[Main_Idea_Node]`: The topic sentences introducing the core arguments.
- `[Supporting_Evidence_Node]`: Explanations or logic extending the main idea.
- `[Example_Node]`: Real-world or hypothetical examples illustrating the argument.
- `[Rebuttal_Node]` (Optional but high-band): Acknowledging and refuting counter-arguments.

### 2.2 Band Constraint Rules (Logic Engine)
* **Band 5.0 (Penalty Ceiling):**
  * `IF [Position_Node] IS_UNCLEAR OR_ABSENT THEN MAX_BAND = 5.0`.
  * `IF [Main_Idea_Node] EXISTS BUT [Supporting_Evidence_Node] IS_NULL THEN BAND = 5.0` (Ideas are listed but not developed).
* **Band 6.0 (Acceptable):**
  * `IF [Position_Node] IS_RELEVANT AND [Main_Idea_Node] IS_SUPPORTED`
  * *Constraint:* `[Supporting_Evidence_Node]` might be somewhat repetitive or lack deep logic.
* **Band 7.0 (Good):**
  * `IF [Position_Node] IS_CLEAR_THROUGHOUT AND [Main_Idea_Node] IS_WELL_EXTENDED`
  * *Constraint:* Must include relevant `[Example_Node]` or logical deduction.
* **Band 8.0 (Excellent):**
  * `IF [Main_Idea_Node] IS_FULLY_DEVELOPED AND [Rebuttal_Node] (Optional) IS_EFFECTIVE`.
  * *Constraint:* The logical chain from Position -> Idea -> Evidence -> Conclusion is flawless.

---

## Part 3: Shared Micro-Evaluator Criteria (CC, LR, GRA)

These criteria are structurally identical across both Task 1 and Task 2 and can share the same pipeline.

### 3.1 Coherence and Cohesion (CC)
* **Nodes:** `[Paragraph_Block]`, `[Cohesive_Device_Node]` (e.g., Furthermore, However, Consequently).
* **Rule (Band 6):** `[Cohesive_Device_Node]` is used but may be mechanical.
* **Rule (Band 7):** `[Paragraph_Block]` has clear central topics; `[Cohesive_Device_Node]` is used naturally without attracting attention.

### 3.2 Lexical Resource (LR)
* **Nodes:** `[Vocabulary_Item]` (checked against Oxford Dictionary / Neo4j Graph).
* **Rule (Band 6):** Adequate range, attempts some `[Less_Common_Vocabulary]`.
* **Rule (Band 7):** Uses `[Less_Common_Vocabulary]` with awareness of style and collocation.

### 3.3 Grammatical Range and Accuracy (GRA)
* **Nodes:** `[Sentence_Type: Simple/Complex]`, `[Error_Node]`.
* **Rule (Band 6):** Mix of simple and complex sentences; `[Error_Node]` does not impede communication.
* **Rule (Band 7):** Frequent error-free sentences; excellent control over grammar.
