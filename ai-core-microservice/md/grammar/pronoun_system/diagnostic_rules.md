# QUY TẮC CHẨN ĐOÁN LỖI ĐẠI TỪ (DIAGNOSTIC RULES)

---
metadata:
  complexity_level: "High"
  tags: ["AI_Logic", "Referencing", "Pronoun_Errors"]
  related_to: ["personal_pronouns.md"]
  version: "1.0"
---

## 1. RULE ENGINE SCHEMA

| Error Code | Rule Name | Priority | Trigger Pattern | Remedy / Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **E_PRO_001** | Subject-Object Mixup | 1 (Critical) | `Verb + [I/She/He/We/They]` | Use Object pronouns (me/her/him/us/them) after verbs/prepositions. |
| **E_PRO_002** | Possessive Adj Independent | 2 (High) | `Possessive_Adj + (No Noun)` | Use Possessive Pronoun (mine/hers/theirs...) if no noun follows. |
| **E_PRO_003** | Its vs It's Confusion | 2 (High) | `It's + Noun` (should be Its) | 'Its' is possessive; 'It's' is 'It is'. |
| **E_PRO_004** | Reflective Misuse | 2 (High) | `Subject != Reflexive` | Use reflexive pronouns only when S and O are the same. |
| **E_PRO_005** | Ambiguous Reference | 3 (Medium) | `Multiple nouns before a pronoun` | Clarify which noun the pronoun refers to. |

## 2. CHI TIẾT LỖI THAM CHIẾU (E_PRO_005)
*   **Trigger:** AI phát hiện một đoạn văn dùng đại từ nhưng có 2 danh từ cùng giống đứng trước.
*   **Ví dụ:** "John told Bill that **he** was happy." (He là ai? John hay Bill?)
*   **AI Insight:** "Đại từ này đang gây mơ hồ. Hãy sử dụng tên riêng hoặc cấu trúc khác để làm rõ đối tượng đang được nhắc tới."

## 3. LỖI SỞ HỮU (E_PRO_002)
*   **Sai:** That book is **my**.
*   **Đúng:** That book is **mine**.
*   **AI Insight:** "Tính từ sở hữu (my) bắt buộc phải có danh từ theo sau. Nếu đứng độc lập, hãy dùng đại từ sở hữu (mine)."
