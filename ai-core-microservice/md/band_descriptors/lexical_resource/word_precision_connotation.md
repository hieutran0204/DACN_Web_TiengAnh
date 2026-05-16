# Word Precision and Connotation: Academic Nuance

## 1. Overview
Precision and Connotation are the hallmarks of a **Band 8.0+** writer. This module helps the AI detect the "flavor" and "formality" of words, ensuring they fit the academic context of IELTS Writing Task 2.

## 2. Academic Register (Loại bỏ từ ngữ thân mật)
AI cần quét và gắn tag `[INFORMAL_REGISTER]` cho các từ vựng thuộc văn nói (slang/spoken English).

| Informal Word (Avoid) | Academic Alternative (Use) | AI Logic |
| :--- | :--- | :--- |
| Kids / Guys | Children / Individuals | Check Entity Type |
| Stuff / Things | Aspects / Factors / Elements | Detect Vague Nouns |
| Cop / Police | Law enforcement officers | Terminology check |
| Get / Buy | Obtain / Acquire / Purchase | Verb Upgrade |
| A lot of / Tons of | A significant number of / Myriad | Quantifier check |

## 3. Eliminating Vague Words (Hạn chế từ chung chung)
Văn viết Academic đòi hỏi sự cụ thể. AI sẽ gợi ý thay thế các từ "lười biếng" (lazy words) bằng các từ có độ phủ nghĩa hẹp và sâu hơn.

* **Vague:** "The weather is **bad**."
* **Precise:** "The weather is **inclement** / **volatile**."
* **Vague:** "Reading is a good **thing**."
* **Precise:** "Reading is a beneficial **activity** / **habit**."

---

## 4. Word Connotation (Sắc thái nghĩa)
AI sử dụng **Sentiment Analysis Nodes** để kiểm tra xem sắc thái từ có khớp với ý đồ của câu không.

### A. Positive vs. Negative
* **Notorious (Tiêu cực):** Nổi tiếng vì điều xấu.
    * *❌ Error:* "Bill Gates is a **notorious** billionaire." (Sai sắc thái).
    * *✅ Correct:* "Bill Gates is a **renowned** / **illustrious** philanthropist."
* **Cheap vs. Inexpensive:**
    * *Cheap:* Chất lượng thấp (Tiêu cực).
    * *Inexpensive:* Giá cả hợp lý (Trung lập/Tích cực).

### B. Strength of Word (Cường độ)
* **Suggest vs. Assert:** "Suggest" là gợi ý nhẹ nhàng, "Assert" là khẳng định mạnh mẽ. AI sẽ check xem nếu người dùng đang đưa ra luận điểm chính mà dùng "suggest" thì có thể gợi ý dùng từ mạnh hơn.

---

## 5. RAG Metadata & Scoring Logic
* **Node Type:** `Lexical_Nuance`.
* **Properties:** * `register_level`: (Informal, Neutral, Formal).
    * `sentiment_polarity`: (-1 to 1).
    * `precision_weight`: (High, Medium, Low).
* **Graph Logic:** * Nếu một `Sentence_Node` chứa > 2 `Informal_Words` -> Hạ điểm `Register_Score`.
    * Nếu `Connotation` của từ trái ngược với `Sentiment` tổng thể của câu -> Flag `[SEMANTIC_MISMATCH]`.

---

## 6. Implementation Strategy (The "Semantic Filter")

1. **Register Filter:** AI trích xuất thực thể, tra cứu trong `Register_Dictionary`. Nếu từ nằm ở mức `Informal`, gợi ý 3 từ `Academic` tương đương.
2. **Connotation Tracker:** Khi AI nhận diện một tính từ, nó sẽ kiểm tra xem thực thể mà tính từ đó bổ nghĩa có thuộc tính "Positive" hay "Negative" trong Graph tri thức không.
3. **Contextual Suggestion:** Sử dụng mô hình ngôn ngữ để phân tích: "Dựa trên ngữ cảnh học thuật này, bạn nên dùng từ 'A' thay vì từ 'B' vì từ 'B' thường dùng trong giao tiếp hằng ngày."

---

## 7. Example for AI Feedback

**❌ User Input:** "The **stuff** that **guys** do to protect the environment is **good**."
**🤖 AI Feedback:**
* **Register Error:** Thay 'stuff' bằng 'measures' hoặc 'actions'. Thay 'guys' bằng 'individuals'.
* **Precision Error:** Thay 'good' bằng 'commendable' hoặc 'effective'.
* **Result:** "The **measures** that **individuals** take to protect the environment are **commendable**."