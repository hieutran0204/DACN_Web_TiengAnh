# QUY TẮC CHẨN ĐOÁN LỖI CẤU TẠO TỪ (DIAGNOSTIC RULES)

---
metadata:
  complexity_level: "High"
  tags: ["AI_Logic", "Word_Form_Errors", "Lexical_Resource"]
  related_to: ["suffixes.md", "word_class_transformation.md"]
  version: "1.0"
---

## 1. RULE ENGINE SCHEMA

| Error Code | Rule Name | Priority | Trigger Pattern | Remedy / Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **E_WDF_001** | Wrong Word Class | 1 (Critical) | `Adjective at Noun position` | Use the noun form of the word (e.g., success instead of succeed). |
| **E_WDF_002** | Wrong Negative Prefix | 2 (High) | `un-possible` or `dis-correct` | Use the correct negative prefix (impossible, incorrect). |
| **E_WDF_003** | Adverb as Adjective | 2 (High) | `A slowly car` | Use an adjective before a noun (a slow car). |
| **E_WDF_004** | Spelling -y to -ies | 3 (Medium) | `partys` or `familys` | Change 'y' to 'i' before adding 'es' (parties, families). |

## 2. CHI TIẾT LỖI TỪ LOẠI (E_WDF_001)
*   **Trigger:** AI phân tích cấu trúc câu (Syntax) và đối chiếu với từ loại của từ đang dùng.
*   **Sai:** The **develop** of technology... (Verb at Subject position).
*   **Đúng:** The **development** of technology... (Noun required).
*   **AI Insight:** "Ở vị trí này, bạn cần một danh từ thay vì một động từ."

## 3. LỖI TIỀN TỐ PHỦ ĐỊNH (E_WDF_002)
*   **Trigger:** AI quét các từ có tiền tố lạ không tồn tại trong từ điển.
*   **Sai:** It is **unpossible**.
*   **Đúng:** It is **impossible**.
