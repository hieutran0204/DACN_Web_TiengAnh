# QUY TẮC CHẨN ĐOÁN LỖI CÂU ĐIỀU KIỆN (DIAGNOSTIC ENGINE V2)

---
metadata:
  complexity_level: "High"
  tags: ["AI_Logic", "Error_Detection", "Validation"]
  related_to: ["overview.md", "ielts_usage.md"]
  version: "2.0"
---

Bộ quy tắc này được thiết kế để AI hoạt động như một Linter chuyên nghiệp.

## 1. RULE ENGINE SCHEMA

| Error Code | Rule Name | Priority | Trigger Pattern | Remedy / Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **E_CON_001** | Will in If-Clause | 1 (Critical) | `If + S + will + V` | Remove 'will', use Present Simple. |
| **E_CON_002** | Type 2 Tense Mismatch | 2 (High) | `If + S + V2, S + will + V1` | Change 'will' to 'would'. |
| **E_CON_003** | Was for Were | 3 (Medium) | `If + [I/He/She/It] + was` | In formal contexts, use 'were'. |
| **E_CON_004** | Unless Negation | 2 (High) | `Unless + S + [not/don't]` | Remove negation after Unless. |
| **E_CON_005** | Inversion Syntax | 1 (Critical) | `If + [Should/Were/Had] + S` | Remove 'If' when using inversion. |
| **E_CON_006** | Mixed Logic Error | 2 (High) | `If + V2, S + would have V3` | Check if result is in past or present. |

## 2. CONFLICT RESOLUTION (QUY TẮC ƯU TIÊN)
Nếu một câu vi phạm nhiều lỗi, AI sẽ xử lý theo thứ tự `Priority`:
1.  **Priority 1 (Syntax/Critical):** Lỗi khiến câu vô nghĩa hoặc sai cấu trúc cơ bản (E_CON_001, E_CON_005).
2.  **Priority 2 (Grammar/Logic):** Lỗi sai thì hoặc sai logic điều kiện (E_CON_002, E_CON_004, E_CON_006).
3.  **Priority 3 (Style/Nuance):** Lỗi về phong cách hoặc sắc thái trang trọng (E_CON_003).

## 3. SEMANTIC VALIDATION LAYER
AI cần kiểm tra tính chất của sự việc:
*   **Realism Check:** Sự việc có thật hay không? (Nếu có thật -> Loại 1; Nếu không -> Loại 2).
*   **Time Check:** Điều kiện nằm ở đâu trên trục thời gian?
