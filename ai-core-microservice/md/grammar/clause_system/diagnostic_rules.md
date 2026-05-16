# QUY TẮC CHẨN ĐOÁN LỖI MỆNH ĐỀ (DIAGNOSTIC RULES)

---
metadata:
  complexity_level: "High"
  tags: ["AI_Logic", "Clause_Errors", "Complex_Sentence_Validation"]
  related_to: ["noun_clauses.md", "adverbial_clauses_overview.md"]
  version: "1.0"
---

## 1. RULE ENGINE SCHEMA

| Error Code | Rule Name | Priority | Trigger Pattern | Remedy / Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **E_CLA_001** | Embedded Question Inversion | 1 (Critical) | `... wh-word + auxiliary + S + V` | Use statement order (S + V) in noun clauses. |
| **E_CLA_002** | Although ... But | 1 (Critical) | `Although + ... + but` | Use either 'Although' or 'But', not both. |
| **E_CLA_003** | Future in Time Clause | 1 (Critical) | `When/As soon as + will` | Use Present Simple for future in time clauses. |
| **E_CLA_004** | Fragment Clause | 2 (High) | `Dependent Clause (No main clause)` | A dependent clause cannot stand alone. |
| **E_CLA_005** | Because ... So | 2 (High) | `Because + ... + so` | Use either 'Because' or 'So', not both. |

## 2. CHI TIẾT LỖI MỆNH ĐỀ DANH TỪ (E_CLA_001)
*   **Trigger:** AI phát hiện cấu trúc câu hỏi lồng trong câu trần thuật.
*   **Sai:** I don't know **where is the library**.
*   **Đúng:** I don't know **where the library is**.
*   **AI Insight:** "Mệnh đề danh từ không sử dụng cấu trúc đảo ngữ như câu hỏi."

## 3. LỖI DÙNG DƯ THỪA LIÊN TỪ (E_CLA_002, E_CLA_005)
*   **Sai:** **Although** he is tired, **but** he still works.
*   **Đúng:** **Although** he is tired, he still works.
*   **AI Insight:** "Không được dùng cả liên từ nhượng bộ (Although) và liên từ đối lập (But) trong cùng một câu ghép."
