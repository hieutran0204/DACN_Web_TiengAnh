# QUY TẮC CHẨN ĐOÁN LỖI TỔNG HỢP (DIAGNOSTIC RULES)

---
metadata:
  complexity_level: "High"
  tags: ["AI_Logic", "Confusing_Pairs_Detector", "Lexicon"]
  related_to: ["confusing_verbs.md", "confusing_logic_pairs.md"]
  version: "1.0"
---

## 1. RULE ENGINE SCHEMA

| Error Code | Rule Name | Priority | Trigger Pattern | Remedy / Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **E_ERR_001** | Say with Object | 1 (Critical) | `Say + someone + that` | Use 'Tell' instead of 'Say' when there is a direct person object. |
| **E_ERR_002** | Make Homework | 2 (High) | `Make homework/exercise` | Use 'Do' for academic tasks and exercises. |
| **E_ERR_003** | Since + Duration | 2 (High) | `Since + period of time` | Use 'For' for durations (e.g., for 5 years). |
| **E_ERR_004** | During + Clause | 1 (Critical) | `During + S + V` | Use 'While' before a clause; 'During' is for nouns. |
| **E_ERR_005** | Borrow someone | 2 (High) | `Borrow someone something` | Use 'Lend someone something' or 'Borrow from someone'. |

## 2. CHI TIẾT LỖI SAY/TELL (E_ERR_001)
*   **Trigger:** AI phân tích xem sau động từ có tân ngữ chỉ người ngay lập tức hay không.
*   **Sai:** He **said me** that he was tired.
*   **Đúng:** He **told me** that he was tired. / He **said to me** that...
*   **AI Insight:** "Say không đi trực tiếp với tân ngữ chỉ người."

## 3. LỖI MAKE/DO (E_ERR_002)
*   **Sai:** I need to **make** my homework.
*   **Đúng:** I need to **do** my homework.
*   **AI Insight:** "Học tập và làm bài tập là các hoạt động (activities), hãy dùng 'Do'."
