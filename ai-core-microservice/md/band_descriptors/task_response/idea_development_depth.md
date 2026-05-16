# Idea Development and Depth: Beyond Surface-Level Listing

## 1. Overview
Task Response (TR) at higher bands (7.0+) requires that "main ideas are extended and supported." The AI must distinguish between **Listing** (mentioning many ideas without detail) and **Developing** (explaining a few ideas in depth).

## 2. The Development Hierarchy (PEEL Logic)
The AI analyzes the depth of each `Paragraph_Node` by looking for a hierarchical structure of supporting entities.

### A. Level 1: Main Idea (The "Point")
* **Detection:** The `Topic_Sentence` containing the primary argument for the paragraph.
* **Graph Node:** `Main_Idea_Node`.

### B. Level 2: Explanation (The "Why/How")
* **Detection:** Sentences that clarify the `Main_Idea` using causal linkers (*This is because, Due to, As a result*).
* **Graph Edge:** `(Explanation_Node) --[CLARIFIES]--> (Main_Idea_Node)`.

### C. Level 3: Evidence/Example (The "Proof")
* **Detection:** Specific entities or scenarios introduced by example markers (*For instance, Such as, A clear example of this is*).
* **Graph Edge:** `(Example_Node) --[SUBSTANTIATES]--> (Explanation_Node)`.

---

## 3. Logic for Depth Assessment

AI calculates the **Development Score** based on the "Branching Factor" of each idea.

| Pattern Found | AI Diagnosis | TR Band Impact |
| :--- | :--- | :--- |
| Point -> Point -> Point | **Listing (Over-extended)**: Too many ideas, no depth. | **Band 5.0** |
| Point -> Explanation | **Adequate but simple**: Lacks concrete grounding. | **Band 6.0** |
| Point -> Explanation -> Example | **Well-developed**: Fully supported argument. | **Band 7.0 - 8.0** |
| Point -> Complex Explanation -> Diverse Evidence | **Sophisticated**: Deep analytical depth. | **Band 9.0** |

---

## 4. GraphRAG Implementation: "The Chain Check"

* **Node Types:** `Main_Idea`, `Supporting_Detail`, `Example_Entity`.
* **Graph Logic:**
    * AI measures the **Path Length** from the `Paragraph_Root` to its leaf nodes.
    * A "Healthy" paragraph should have a minimum path depth of 3 levels (Point -> Explain -> Example).
    * If multiple `Main_Idea` nodes exist in one paragraph without `Supporting_Detail` edges, flag `[IDEA_LISTING_ERROR]`.

---

## 5. Implementation Strategy for Hiếu

1. **Relation Extraction:** Use the LLM to identify the functional role of each sentence. Does it "introduce," "explain," or "exemplify"?
2. **Connectivity Analysis:** * *Query:* `MATCH (p:Paragraph {id: 1})-[:CONTAINS]->(m:Main_Idea) OPTIONAL MATCH (m)<-[:EXTENDS]-(s:Support) RETURN count(s)`
   * If `count(s) == 0`, the idea is "undeveloped."
3. **Redundancy Check:** If the AI detects that the `Explanation_Node` is just a paraphrase of the `Main_Idea_Node` (Semantic Similarity > 0.9), it flags `[CIRCULAR_REASONING]`.

---

## 6. Training Mode: Development Examples

**❌ Listing (Band 5.0):**
> "Technology is good. It saves time. It makes communication easier. It helps students learn better."
> **AI Diagnosis:** 3 Main Ideas, 0 Supporting Details. Structure: [Point] -> [Point] -> [Point].

**✅ Developing (Band 7.5+):**
> "Technology saves a significant amount of time. **This is because** automation handles repetitive tasks, allowing people to focus on creative work. **For example**, modern software can process accounting data in seconds, which previously took days for human workers."
> **AI Diagnosis:** 1 Main Idea, 1 Explanation, 1 Specific Example. Structure: [Point] -> [Explain] -> [Example].

---

## 7. Metadata
* **Domain:** Task_Response
* **Focus:** Logical_Extension, Depth_over_Breadth, Evidence_Quality
* **Relationship:** Complements_Paragraphing (Cohesion)