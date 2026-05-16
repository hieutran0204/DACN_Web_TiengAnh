# QUY TẮC CHẨN ĐOÁN LỖI THÌ (TENSES DIAGNOSTIC ENGINE)

---
metadata:
  complexity_level: "High"
  tags: ["AI_Logic", "Tense_Validation", "Time_Signals"]
  related_to: ["Present tenses", "Past tenses", "Future forms"]
  version: "1.0"
---

Bộ quy tắc giúp AI phát hiện sự mâu thuẫn giữa Động từ và Trạng từ thời gian (Time Signals).

## 1. RULE ENGINE SCHEMA

| Error Code | Rule Name | Priority | Trigger Pattern | Remedy / Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **E_TNS_001** | Present Perfect vs Past Simple | 1 (Critical) | `Present Perfect + Specific Past Time` | Remove specific time or change to Past Simple. |
| **E_TNS_002** | Progressive State Verbs | 2 (High) | `State Verb (love, hate, know) + Continuous` | Use Simple tense for state verbs. |
| **E_TNS_003** | Future in Time Clause | 1 (Critical) | `When/As soon as + will + V` | Use Present Simple after time conjunctions. |
| **E_TNS_004** | Subject-Verb Mismatch | 1 (Critical) | `He/She/It + V (base form)` | Add -s/-es for 3rd person singular. |
| **E_TNS_005** | Since/For Confusion | 2 (High) | `Since + duration / For + point in time` | Use 'Since' for point, 'For' for duration. |

## 2. TIMELINE MISMATCH (TRÙNG LẶP & MÂU THUẪN)
AI cần quét các **Time Tokens** để đối chiếu:
*   **Past Tokens:** `["yesterday", "ago", "last", "in 1990", "previously"]` -> Bắt buộc dùng quá khứ.
*   **Perfect Tokens:** `["since", "for", "up to now", "so far", "recently"]` -> Ưu tiên thì hoàn thành.
*   **Future Tokens:** `["tomorrow", "next", "soon", "in the future"]` -> Ưu tiên các dạng tương lai.

## 3. PRIORITY LOGIC
1.  **S-V Agreement (E_TNS_004):** Phải sửa lỗi chia ngôi trước vì đây là lỗi cơ bản nhất.
2.  **Tense Mismatch (E_TNS_001, E_TNS_003):** Sửa lỗi sai thì so với thời gian.
3.  **Nuance Error (E_TNS_002):** Sửa lỗi về sắc thái động từ.
