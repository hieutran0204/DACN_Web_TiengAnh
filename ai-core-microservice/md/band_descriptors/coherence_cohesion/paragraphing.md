# Paragraphing: Structural Unity and Organization

## 1. The "One-Idea-Per-Paragraph" Rule
The core of effective paragraphing in IELTS is ensuring each paragraph focuses on a single, clear central topic.

* **Topic Sentence:** Every body paragraph must begin with a sentence that explicitly states the main idea.
* **Supporting Sentences:** All subsequent sentences in that paragraph must develop, explain, or provide examples for that topic sentence.
* **AI Logic:** If the AI detects multiple high-level entities from different domains within one paragraph, it should flag `[POTENTIAL_IDEA_OVERLAP]`.

## 2. Paragraph Structure (The PEEL Framework)
AI should check if each paragraph follows a logical progression:
1.  **P (Point):** Main idea (Topic Sentence).
2.  **E (Explanation):** Elaborating on why/how.
3.  **E (Evidence/Example):** Real-world proof or data.
4.  **L (Link):** Connecting the point back to the overall essay prompt.

## 3. Transitioning Between Paragraphs
How to signal the move from one aspect to another.
* **Signaling the next step:** "Turning to the social implications...", "Another significant factor is...", "On the other hand, from an economic perspective...".
* **AI Logic:** Check the first sentence of a new paragraph for "Transition Markers" to ensure smooth global cohesion.

---

## 4. Common Paragraphing Errors (For AI Tagging)

### A. The "Wall of Text" (Under-paragraphing)
* **Definition:** Writing the entire essay as one or two massive blocks.
* **AI Metric:** If word count per paragraph > 150 words without a clear transition.
* **Impact:** Drastic reduction in Coherence and Cohesion score (Band 5.0).

### B. "Fragmented" Paragraphs (Over-paragraphing)
* **Definition:** Each sentence is its own paragraph.
* **AI Metric:** If paragraph count > 6 and average sentences per paragraph < 3.
* **Impact:** Ideas feel disconnected and underdeveloped.

### C. Lack of Topic Sentence
* **Definition:** Starting a paragraph with a detail or an example instead of a general point.
* **AI Metric:** Check if the first sentence of the body paragraph is too specific (e.g., contains "For instance").

---

## 5. Band Descriptor Markers for Paragraphing

| Band | Performance Characteristics |
| :--- | :--- |
| **9.0** | Paragraphing is optimal and logical throughout. Each paragraph has a clear central topic. |
| **7.0** | Paragraphing is generally logical, with a clear central topic in each paragraph. |
| **5.0** | May lack any paragraphing or have inconsistent/illogical paragraphing. |

---

## 6. RAG & GraphRAG Metadata
* **Node:** `Paragraph_Node`.
* **Property:** `central_topic_entity`, `sentence_count`, `logic_flow_score`.
* **Edges:** `SEQUENCED_AFTER`, `CONTRASTS_WITH_PREVIOUS`, `CONCLUDES`.
* **Graph Logic:** If a `Paragraph_Node` has weak edges to its internal `Sentence_Nodes`, the coherence is low.

## 7. Example for AI Analysis

**❌ Poor Paragraphing (Band 5.0):**
> [Para 1] Education is important. Students need to learn many things. Also, teachers should be paid more. Environment is also a problem. We need to plant more trees because global warming is real.
> *Reason: Too many unrelated ideas in one paragraph.*

**✅ Logical Paragraphing (Band 7.5+):**
> [Para 2 - Topic: Economic impact] To begin with, the economic benefits of tourism are undeniable. Many developing countries rely on this industry as their primary source of foreign exchange...
> [Para 3 - Topic: Environmental impact] However, these financial gains often come at an environmental cost. The influx of tourists can lead to habitat destruction and increased waste...