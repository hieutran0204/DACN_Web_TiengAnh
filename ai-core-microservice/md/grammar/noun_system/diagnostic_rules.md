# QUY TẮC CHẨN ĐOÁN LỖI HỆ DANH TỪ (DIAGNOSTIC RULES)

---
metadata:
  complexity_level: "High"
  tags: ["AI_Logic", "Noun_Errors", "Article_Errors"]
  related_to: ["noun_types.md", "articles_rules.md"]
  version: "1.0"
---

## 1. RULE ENGINE SCHEMA

| Error Code | Rule Name | Priority | Trigger Pattern | Remedy / Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **E_NOU_001** | A/An with Uncountable | 1 (Critical) | `a/an + uncountable_noun` | Remove 'a/an' or use a counter (e.g., 'a piece of'). |
| **E_NOU_002** | Plural Uncountable | 1 (Critical) | `uncountable_noun + -s/-es` | Uncountable nouns have no plural form. |
| **E_ART_001** | Missing 'The' (Unique) | 2 (High) | `(No The) + sun/moon/world` | Add 'The' before unique entities. |
| **E_ART_002** | The with General Plural | 3 (Medium) | `The + Plural_Noun (General)` | Remove 'The' when speaking in general. |
| **E_DET_001** | Much/Many Mismatch | 1 (Critical) | `Much + Countable` or `Many + Uncountable` | Use 'Much' for uncountable, 'Many' for countable. |
| **E_DET_002** | Few/Little Mismatch | 1 (Critical) | `Few + Uncountable` or `Little + Countable` | Use 'Few' for countable, 'Little' for uncountable. |

## 2. CHI TIẾT LỖI DANH TỪ KHÔNG ĐẾM ĐƯỢC (E_NOU_002)
*   **Trigger:** AI phát hiện các từ như *informations, advices, knowledges, furnitures, equipments*.
*   **AI Insight:** "Đây là các danh từ không đếm được, bạn không được thêm đuôi -s vào sau chúng."

## 3. LỖI MẠO TỪ TRONG SO SÁNH NHẤT (E_ART_001)
*   **Trigger:** So sánh nhất nhưng thiếu 'The'.
*   **Sai:** It is **most beautiful** place.
*   **Đúng:** It is **the most beautiful** place.
