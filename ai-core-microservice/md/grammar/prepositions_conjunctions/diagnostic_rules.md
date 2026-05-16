# QUY TẮC CHẨN ĐOÁN LỖI GIỚI TỪ & LIÊN TỪ (DIAGNOSTIC RULES)

---
metadata:
  complexity_level: "High"
  tags: ["AI_Logic", "Preposition_Errors", "Punctuation"]
  related_to: ["prepositions_time_place.md", "conjunctions_types.md"]
  version: "1.0"
---

## 1. RULE ENGINE SCHEMA

| Error Code | Rule Name | Priority | Trigger Pattern | Remedy / Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **E_PRE_001** | Wrong Time Preposition | 2 (High) | `in/on/at + Mismatched Time` | Use 'In' for months/years, 'On' for days, 'At' for time. |
| **E_PRE_002** | Wrong Place Preposition | 2 (High) | `in/on/at + Mismatched Place` | Use 'In' for countries/cities, 'At' for addresses. |
| **E_CNJ_001** | Comma Splice | 1 (Critical) | `Clause, Clause (No FANBOYS)` | Connect independent clauses with a conjunction or semicolon. |
| **E_CNJ_002** | Missing Comma (Subord) | 2 (High) | `Subord_Conj + Clause + (No Comma) + Clause` | Use a comma after the dependent clause when it starts the sentence. |
| **E_CNJ_003** | Redundant Conjunction | 1 (Critical) | `Although... but / Because... so` | Use only one conjunction to show relationship. |

## 2. CHI TIẾT LỖI COMMA SPLICE (E_CNJ_001)
*   **Trigger:** AI phát hiện hai câu độc lập nối với nhau chỉ bằng dấu phẩy mà không có liên từ kết hợp.
*   **Sai:** It is sunny, we go to the beach.
*   **Đúng:** It is sunny**, and** we go to the beach.
*   **AI Insight:** "Đây là lỗi dấu phẩy (Comma Splice). Bạn cần thêm liên từ hoặc dùng dấu chấm phẩy."

## 3. LỖI GIỚI TỪ THỜI GIAN (E_PRE_001)
*   **Sai:** **In** Monday / **At** June.
*   **Đúng:** **On** Monday / **In** June.
*   **AI Insight:** "Dùng 'On' cho các thứ trong tuần và 'In' cho tháng/năm."
