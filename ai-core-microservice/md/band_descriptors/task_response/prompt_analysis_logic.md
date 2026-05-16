# Prompt Analysis Logic: Strategic Task Decoding

## 1. Overview
Before assessing a student's response, the AI must establish a "Golden Standard" by decoding the prompt. Task Response (TR) measures how well the candidate addresses all parts of the question and whether their opinion is consistent throughout the essay.

## 2. Keywords & Entity Extraction
The AI identifies the core components of the prompt to create a **Target Knowledge Graph**.

### A. Content Entities (The "What")
* **Main Topic:** The broad subject (e.g., *Education*).
* **Specific Focus:** The narrow scope (e.g., *Online learning vs. Traditional classroom*).
* **Target Groups:** Who is affected? (e.g., *Students, Teachers, Developing nations*).

### B. Restriction Entities (The "Boundaries")
* **Quantifiers:** *Only, All, Best, Every* (AI must check if the student addresses these "absolutes").
* **Time/Place:** *In the modern world, In schools, In the future.*

---

## 3. Instruction Type Identification
The AI classifies the prompt into one of the standard IELTS Task 2 formats to determine the **Required Response Structure**.

| Instruction Category | Key Phrases in Prompt | AI Requirement (Success Criteria) |
| :--- | :--- | :--- |
| **Opinion (Agree/Disagree)** | *To what extent do you agree...?* | A clear position must be stated and maintained. |
| **Discussion (Both Views)** | *Discuss both views and give your opinion.* | **Must** analyze Side A and Side B. Single-sided = Penalty. |
| **Problem & Solution** | *What are the causes? How can we solve...?* | Must address both Causes and Solutions. |
| **Two-part Question** | *Why is this? Is it a positive development?* | Each question must be answered with equal weight. |

---

## 4. AI Logic: Task Completion Analysis

AI performs a **Coverage Check** between the `Prompt_Graph` and the `Essay_Graph`.

### A. The "Addressing All Parts" Check
* **Logic:** If the prompt has two parts (e.g., *Advantages* and *Disadvantages*) and the AI detects only one `Paragraph_Node` covering *Advantages*, it triggers a flag.
* **Flag:** `[INCOMPLETE_TASK_RESPONSE]` -> Maximum Band 5.0 for TR.

### B. Off-Topic Detection (Semantic Drift)
* **Logic:** AI calculates the semantic distance between the prompt's `Keywords` and the essay's `Central_Topic_Entities`.
* **Flag:** `[OFF_TOPIC_WARNING]` if the distance exceeds a certain threshold.

### C. Prompt Transformation (Restatement Check)
* **Logic:** AI checks the Introduction for a paraphrase of the prompt. If the student copies the prompt word-for-word, those words are **excluded** from the total word count.

---

## 5. RAG Metadata & Graph Logic
* **Node Type:** `Prompt_Requirement`, `Task_Entity`.
* **Property:** `instruction_type`, `required_sections`, `mandatory_entities`.
* **Graph Logic:**
    * `(Essay_Node) --[ADDRESSES]--> (Prompt_Requirement)`.
    * If an `Essay_Node` fails to link to a `Prompt_Requirement` node, the TR score is automatically capped.

---

## 6. Implementation Strategy for Hiếu

1. **Prompt Parsing:** Use the LLM to output a JSON schema of the prompt requirements (e.g., `{ "type": "discussion", "entities": ["technology", "classroom"], "min_sides": 2 }`).
2. **Structural Validation:** Before deep-diving into grammar, the AI checks if the number of Body Paragraphs matches the `Instruction Type`.
3. **Consistency Tracker:** AI tracks the "Opinion" entity from the Introduction through to the Conclusion. If the opinion flips (e.g., Intro says "Agree" but Body 2 says "Disagree"), trigger `[INCONSISTENT_POSITION]`.

---

## 7. Example for AI Reasoning

**Prompt:** *"Some people think that technology makes life easier. Others disagree. Discuss both views and give your opinion."*

**🤖 AI Analysis Logic:**
* **Type:** Discussion (Both Views).
* **Required Nodes:** `Side_A (Easier)`, `Side_B (Not Easier)`, `Student_Opinion`.
* **Student Input:** Writes 3 paragraphs about how technology is great but **never** mentions why some people disagree.
* **AI Assessment:** `Side_B_Node` is missing. TR Score: **Band 5.0**.