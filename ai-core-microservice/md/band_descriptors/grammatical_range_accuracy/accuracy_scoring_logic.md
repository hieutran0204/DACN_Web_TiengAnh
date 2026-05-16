# Accuracy Scoring Logic: Quantifying Grammatical Precision

## 1. Overview
This logic defines how the AI converts the number and types of errors into a standardized IELTS Band Score for **Grammatical Range and Accuracy (GRA)**. It focuses on the frequency of "error-free sentences" vs. "sentences with errors."

## 2. Quantitative Metrics (The Scoring Table)

AI will calculate the **Error-Free Sentence Ratio (EFSR)** using the formula:
$$EFSR = \frac{\text{Number of Error-Free Sentences}}{\text{Total Sentences in Essay}} \times 100\%$$

| Band | EFSR Range | Error Impact Description |
| :--- | :--- | :--- |
| **9.0** | 95% - 100% | Only extremely rare "slips" (typos). No systemic errors. |
| **8.0** | 80% - 94% | Majority of sentences are error-free. Occasional minor errors. |
| **7.0** | 60% - 79% | **Frequent error-free sentences.** Errors are localized and non-systemic. |
| **6.0** | 40% - 59% | **Some errors.** Meaning is still clear, but errors occur regularly. |
| **5.0** | < 40% | Errors are frequent and start to impede communication (reader has to re-read). |

## 3. Error Weighting (Trọng số lỗi)
Không phải lỗi nào cũng bị trừ điểm như nhau. AI cần phân loại lỗi theo mức độ nghiêm trọng:

### A. Minor Errors (Lỗi nhẹ) - Deduction: 0.1
* Spelling (nếu không làm đổi nghĩa từ).
* Articles (*a, an, the*) ở các ngữ cảnh không quan trọng.
* Punctuation (thiếu dấu phẩy ở vị trí không gây hiểu lầm).

### B. Major Errors (Lỗi nặng) - Deduction: 0.3
* **Subject-Verb Agreement** (Sai ngôi).
* **Tense Shift** (Sai thì).
* **Word Order** (Sai trật tự từ).
* **Comma Splice** (Lỗi nối câu sai quy tắc).

### C. Fatal Errors (Lỗi nghiêm trọng) - Deduction: 0.5
* **Fragment Sentences** (Câu không đủ thành phần).
* **Meaning Obscured** (Lỗi khiến AI không thể hiểu nổi ý của người viết).

## 4. AI Analysis Logic

### Step 1: Sentence Parsing
* AI chia bài viết thành các `Sentence_Nodes`.
* Với mỗi node, AI thực hiện kiểm tra chéo với `common_errors_catalog.md` và `punctuation.md`.

### Step 2: Quality Classification
* **Clean Node:** Không chứa bất kỳ lỗi nào.
* **Dirty Node:** Chứa ít nhất 1 lỗi.

### Step 3: Global Assessment
* Nếu EFSR đạt 70% nhưng các câu còn lại mắc lỗi "Fatal Errors" -> Hạ xuống Band 6.0.
* Nếu EFSR chỉ đạt 50% nhưng toàn lỗi "Minor" -> Cân nhắc giữ ở Band 6.0 thay vì xuống 5.0.

## 5. RAG Metadata & Feedback
* **Entity:** `Scoring_Algorithm`.
* **Property:** `efsr_threshold`, `penalty_weights`.
* **Graph Logic:** * `Essay_Node` --[HAS_ACCURACY_SCORE]--> `Final_Band`.
    * Track lịch sử lỗi: Nếu người dùng lặp lại cùng 1 lỗi (ví dụ: chia động từ) 5 lần -> AI đánh nhãn "Systemic Error" (Lỗi hệ thống) -> Trừ điểm nặng hơn.

---

## 6. Feedback Generation Examples

* **Band 7.0 Feedback:** "Bài viết của bạn có nhiều câu đúng hoàn toàn (EFSR: 72%). Tuy nhiên, bạn vẫn mắc một vài lỗi nhỏ về dấu câu. Hãy chú ý hơn để đạt Band 8.0."
* **Band 6.0 Feedback:** "Mặc dù ý tưởng rõ ràng, nhưng bạn mắc khá nhiều lỗi chia động từ và mạo từ. Điều này khiến bài viết chưa đạt được độ mượt mà của Band cao hơn."