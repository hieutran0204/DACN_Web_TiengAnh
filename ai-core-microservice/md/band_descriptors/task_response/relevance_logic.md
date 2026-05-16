# Relevance Logic: Off-topic and Tangential Detection

## 1. Overview
Relevance measures how closely the essay's content aligns with the specific requirements of the prompt. The AI must distinguish between **Core Content** (directly related), **Contextual Content** (supporting info), and **Tangential/Off-topic Content** (irrelevant drift).

## 2. Semantic Mapping Logic
The AI establishes a **Relevance Score** by comparing the `Prompt_Graph` (target) with the `Essay_Graph` (actual).

### A. Core Entity Matching
* **Logic:** Does the essay contain the primary entities extracted from the prompt?
* **Example:** If the prompt mentions "Online Education," the AI looks for nodes related to *Digital Learning, Virtual Classrooms, E-learning platforms*.
* **Status:** `[CORE_MATCH]`

### B. Logical Bridging (The "Connection" Check)
* **Problem:** A student discusses a related topic (e.g., "Economics") in an "Education" essay.
* **AI Requirement:** The AI must find an **Edge** (Link) that explains the relationship.
    * *Valid Link:* `(Education) --[AFFECTS]--> (Economic_Growth)` -> **Relevant**.
    * *Invalid Link:* A whole paragraph about "Stock Markets" with no connection to "Education" -> **Tangential**.

---

## 3. Off-Topic Classification Levels

| Level | AI Observation | TR Band Impact |
| :--- | :--- | :--- |
| **Directly Relevant** | Essay stays within the semantic boundaries of the prompt entities. | **7.0 - 9.0** |
| **Tangential** | Only part of the prompt is addressed, or the writer drifts into unrelated side-topics. | **5.0 - 6.0** |
| **Off-Topic** | The essay misinterprets the prompt or discusses a completely different subject. | **4.0 or below** |

---

## 4. AI Logic: Tangential Drift Detection

AI calculates the **Semantic Center** of each paragraph.

1. **Extraction:** Identify all `Noun_Entities` in a paragraph.
2. **Clustering:** Group them into a theme (e.g., "Technology").
3. **Prompt Alignment:** If a paragraph theme (e.g., "International Trade") has a **Low Cosine Similarity** (< 0.3) with all prompt entities, the AI flags it.
4. **Flag:** `[TANGENTIAL_CONTENT_DETECTED]`

---

## 5. RAG & Graph Logic: Semantic Distance

* **Node Type:** `Prompt_Requirement`, `Essay_Entity`.
* **Graph Logic:**
    * Use **Vector Embeddings** to represent each node.
    * Calculate the `Shortest Path` in a Knowledge Graph between the Student's Idea and the Prompt's Topic.
    * If the path requires > 3 "jumps" through unrelated nodes (e.g., Education -> Jobs -> Economy -> Stock Market), the relevance is considered weak.

---

## 6. Implementation Strategy for Hiếu

1. **Entity Filtering:** Use an LLM to prune "noise" words and focus only on content-bearing entities.
2. **Contextual Relevance Check:** Before flagging, check if the "Off-topic" section is used as a **Comparison** or **Example**. 
   * *Rule:* If an unrelated entity is connected via a `Comparative_Linker` (*Unlike, In contrast to*), it is likely relevant as a counter-point.
3. **Threshold Setting:** Set a "Relevance Threshold" (e.g., 60%). If more than 30% of the essay falls below this threshold, trigger a major Task Response penalty.

---

## 7. Example for AI Reasoning

**Prompt:** *"Should schools spend more money on technology or on teachers?"*

**❌ Tangential/Off-topic (Band 5.0):**
> "Technology is very important for the economy. Many companies like Apple and Google make a lot of profit. This profit helps the government build roads and bridges..."
> **AI Diagnosis:** The student has drifted from "School Technology" to "Global Economy/Infrastructure." No logical bridge back to the prompt.

**✅ Relevant (Band 7.5+):**
> "Investing in school technology is vital because it prepares students for the modern workforce. **Consequently**, this improves the national economy by providing skilled labor for tech giants like Apple..."
> **AI Diagnosis:** The student uses "Economy" as a **result** of "School Technology," maintaining a clear logical bridge.