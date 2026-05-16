# Punctuation Rules: The Syntax Precision Guide

## 1. Overview
Punctuation in IELTS Writing is not just about "resting points"; it is a grammatical tool that defines sentence boundaries and relationships. Incorrect punctuation can lead to a lower score in **Grammatical Range and Accuracy (GRA)**.

## 2. The Comma (,) Usage

### A. In Complex Sentences
* **Rule:** If the dependent clause comes first, use a comma. If the independent clause comes first, no comma is usually needed.
    * *✅ Correct:* "Although it was raining**,** the match continued."
    * *✅ Correct:* "The match continued although it was raining."
* **AI Logic:** Detect subordinating conjunctions at the start of a sentence and check for a comma before the main subject.

### B. With Transitional Adverbs (Linkers)
* **Rule:** Words like *However, Therefore, Moreover* at the start of a sentence must be followed by a comma.
    * *✅ Correct:* "However**,** many people disagree."

### C. Non-defining Relative Clauses
* **Rule:** Use commas to enclose extra information.
    * *✅ Correct:* "The Internet**,** which has changed the world**,** is essential."

## 3. The Semicolon (;) - A "Band 7.0+" Weapon
* **Purpose:** To connect two independent clauses that are closely related in meaning without using a conjunction.
* **Pattern:** `[Independent Clause] ; [Independent Clause]`
* **Example:** "Some people prefer city life**;** others enjoy the peace of the countryside."
* **AI Logic:** Check if both sides of the semicolon are full sentences (Subject + Verb).

## 4. Critical Errors (The "Band Score Killers")

### A. Comma Splice (Lỗi nối câu bằng dấu phẩy)
* **Definition:** Joining two independent clauses with only a comma and no coordinating conjunction.
* **❌ Error:** "I love English**,** I study it every day."
* **✅ Correction 1:** "I love English**;** I study it every day." (Semicolon)
* **✅ Correction 2:** "I love English**, and** I study it every day." (Comma + FANBOYS)
* **AI Detection Logic:** If `[Subject-Verb Clause]` + `,` + `[Subject-Verb Clause]` (and no conjunction), flag `[CRITICAL_COMMA_SPLICE]`.

### B. Fragment Sentences
* **Definition:** A sentence that is incomplete (e.g., only a dependent clause).
* **❌ Error:** "Because the weather was bad." (Period used too early).
* **AI Logic:** Flag any sentence starting with a subordinator that doesn't have a second clause.

---

## 5. Band Descriptor Impact (Punctuation)

| Band | Performance Characteristics |
| :--- | :--- |
| **9.0** | Punctuation is accurate and helpful to the reader throughout. |
| **7.0** | Has good control of punctuation but may make a few minor errors. |
| **5.0** | Frequent errors in punctuation which can make the text difficult to read. |

---

## 6. RAG Metadata & Implementation
* **Entity:** `Punctuation_Mark`.
* **Property:** `is_correct` (Boolean), `rule_violated` (Comma_Splice, Fragment).
* **Graph Logic:** * `Sentence_Node` --[HAS_PUNCTUATION]--> `Comma_Node`.
    * Nếu `Comma_Node` kết nối 2 `Independent_Clauses` mà không có `Conjunction_Node` -> Trigger lỗi Comma Splice.

---

## 7. AI Feedback Transformation

**❌ User Input:** "The city is crowded, it is also very noisy."
**🤖 AI Feedback:** "Bạn đang gặp lỗi **Comma Splice**. Đây là lỗi nối hai câu độc lập chỉ bằng dấu phẩy. Hãy thử thay bằng dấu chấm phẩy (;) hoặc thêm từ nối 'and' sau dấu phẩy để bài viết chuyên nghiệp hơn nhé!"