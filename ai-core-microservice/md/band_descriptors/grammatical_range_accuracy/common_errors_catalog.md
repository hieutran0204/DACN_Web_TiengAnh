# Common Errors Catalog: Graph-Based Error Entity System

## 1. Overview
This catalog serves as the **Knowledge Base** for the AI to identify, categorize, and link grammatical errors in a GraphRAG architecture. Instead of hard-coded pattern matching, the AI extracts "Error Instances" and connects them to these predefined "Rule Nodes".

## 2. Core Error Entities (The Nodes)

### A. Subject-Verb Agreement (SVA)
* **Node ID:** `RULE_SVA`
* **Definition:** Mismatch between the number of the subject and the verb.
* **Extraction Logic:** Identify the `Subject_Entity` and `Predicate_Verb` -> Check for Number Consistency.
* **Graph Relation:** `(Subject) --[INCOMPATIBLE_WITH]--> (Verb)`
* **Feedback:** "Subject '{Subject}' is singular, but verb '{Verb}' is plural."

### B. Uncountable Noun Pluralization (UNP)
* **Node ID:** `RULE_UNP`
* **Definition:** Adding plural suffixes to non-count nouns.
* **Target Entities:** `informations`, `advices`, `equipments`, `furnitures`, `homeworks`, `knowledges`.
* **Graph Relation:** `(Word_Instance) --[VIOLATES]--> (Uncountable_Noun_Rule)`
* **Feedback:** "'{Word}' is an uncountable noun and should not be pluralized."

### C. Tense Inconsistency (TIC)
* **Node ID:** `RULE_TIC`
* **Definition:** Unjustified shifting between past, present, and future within a paragraph.
* **Detection Logic:** Compare `Tense_Property` of all `Sentence_Nodes` within a `Paragraph_Node`.
* **Graph Relation:** `(Sentence_A:Past) --[TENSE_CLASH]--> (Sentence_B:Present)`
* **Feedback:** "The tense shifts abruptly from past to present without a temporal marker."

### D. Article Misuse (ART)
* **Node ID:** `RULE_ART`
* **Omission:** Missing 'the' for specific/unique nouns.
* **Redundancy:** Using 'the' for general plurals.
* **Graph Relation:** `(Noun_Phrase) --[MISSING_DETERMINER]--> (Article_The)`

---

## 3. GraphRAG Implementation: "Extract - Link - Reason"

### Step 1: Error Entity Extraction
AI không quét text thô mà trích xuất các **Error Instance Nodes**.
* *User Input:* "The government provide many informations."
* *AI Extracts:* * `Instance_1`: {text: "provide", category: "SVA"}
    * `Instance_2`: {text: "informations", category: "UNP"}

### Step 2: Semantic Linking
Kết nối các Instance này với các Node quy tắc trong file này.
* `(Instance_1) --[INSTANCE_OF]--> (RULE_SVA)`
* `(Instance_2) --[INSTANCE_OF]--> (RULE_UNP)`

### Step 3: Graph Reasoning (Scoring)
* **Frequency Analysis:** Nếu một bài viết có nhiều cạnh nối tới cùng một `RULE_NODE`, AI đánh nhãn lỗi đó là "Systemic" (Lỗi hệ thống).
* **Impact Calculation:** * `Systemic Error` -> Trừ điểm nặng (Deduction: 0.5/instance).
    * `Isolated Slip` -> Trừ điểm nhẹ (Deduction: 0.1/instance).

---

## 4. Band Descriptor Impact Mapping

| Error Type | Band 5.0 (Frequent) | Band 6.0 (Occasional) | Band 7.0 (Rare) |
| :--- | :--- | :--- | :--- |
| **SVA** | Systemic (Multiple nodes) | Present but clear | Error-free sentences |
| **Tense** | Confusion in meaning | Mostly consistent | Accurate control |
| **UNP** | Repeated mistakes | Occasional slips | Precise usage |

---

## 5. RAG Metadata
* **Domain:** Grammatical_Accuracy
* **Node_Type:** `Error_Rule`
* **Edge_Type:** `VIOLATES`, `CONTRASTS_WITH`, `CORRECTED_BY`
* **Search_Query:** "Common grammatical mistakes in IELTS Writing for Vietnamese learners"

---

## 6. Feedback & Correction (The "Heuristic" Part)
Khi một `Error_Instance` được tạo ra, AI sẽ truy vấn Node quy tắc để lấy mẫu sửa lỗi:

> **Example:**
> * **Detected:** "advices"
> * **Rule:** `RULE_UNP`
> * **Correction Suggester:** "Advice is uncountable. You can use 'some advice' or 'pieces of advice' instead."