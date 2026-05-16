# QUY TẮC CHẨN ĐOÁN LỖI CẤU TRÚC ĐẶC BIỆT (DIAGNOSTIC RULES)

---
metadata:
  complexity_level: "High"
  tags: ["AI_Logic", "Wish_Errors", "Causative_Errors"]
  related_to: ["wishes_subjunctive.md", "causative_forms.md"]
  version: "1.0"
---

## 1. RULE ENGINE SCHEMA

| Error Code | Rule Name | Priority | Trigger Pattern | Remedy / Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **E_WSH_001** | Present Wish with V1 | 1 (Critical) | `S + wish + S + V1` | Use V2/ed (Past Simple) for present wishes. |
| **E_WSH_002** | Past Wish with V2 | 1 (Critical) | `S + wish + S + V2` | Use Had + V3 (Past Perfect) for past regrets. |
| **E_WSH_003** | Was in Wish | 3 (Medium) | `S + wish + I/He/She/It + was` | In formal contexts, use 'Were' instead of 'Was'. |
| **E_CAU_001** | Get Someone V1 | 1 (Critical) | `Get + someone + V1` | Use 'To + V1' after 'Get' in causative active. |
| **E_CAU_002** | Have Someone To-V | 1 (Critical) | `Have + someone + To-V` | Use Bare Infinitive (V1) after 'Have' in causative active. |
| **E_CAU_003** | Causative Passive V1 | 1 (Critical) | `Have/Get + something + V1` | Use V3/ed for causative passive (Have something done). |
| **E_SUB_001** | Subjunctive with -s | 2 (High) | `Suggest that + S + V(s/es)` | Use base form (V1) in subjunctive clauses. |

## 2. CHI TIẾT LỖI CÂU ƯỚC (E_WSH_001, E_WSH_002)
*   **Trigger:** AI đối chiếu thời gian được nhắc tới trong câu ước.
*   **Sai:** I wish I **have** a car now.
*   **Đúng:** I wish I **had** a car now.
*   **AI Insight:** "Câu ước luôn phải lùi thì so với thực tế."

## 3. LỖI SAI KHIẾN BỊ ĐỘNG (E_CAU_003)
*   **Sai:** I had my hair **cutted** (Wrong V3) / I had my hair **cut** (Correct).
*   **AI Insight:** "Cấu trúc bị động sai khiến yêu cầu Phân từ quá khứ (V3)."
