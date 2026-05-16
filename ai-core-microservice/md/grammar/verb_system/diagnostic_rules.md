# QUY TẮC CHẨN ĐOÁN LỖI DẠNG ĐỘNG TỪ (DIAGNOSTIC RULES)

---
metadata:
  complexity_level: "High"
  tags: ["AI_Logic", "Verb_Patterns", "Error_Detection"]
  related_to: ["gerund_vs_infinitive.md", "bare_infinitive.md"]
  version: "1.0"
---

## 1. RULE ENGINE SCHEMA

| Error Code | Rule Name | Priority | Trigger Pattern | Remedy / Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **E_VRB_001** | Wrong Gerund/Inf | 1 (Critical) | `Enjoy/Avoid + To-V` or `Decide/Hope + V-ing` | Use V-ing for 'enjoy/avoid' and To-V for 'decide/hope'. |
| **E_VRB_002** | To-V after Modal | 1 (Critical) | `can/must/will + To-V` | Modals must be followed by a Bare Infinitive (V1). |
| **E_VRB_003** | Adjective Suffix | 2 (High) | `I am boring` (when describing feelings) | Use -ed for feelings and -ing for characteristics. |
| **E_VRB_004** | To-V after Make/Let | 1 (Critical) | `Make/Let + someone + To-V` | Use Bare Infinitive after make/let. |
| **E_VRB_005** | Preposition + To-V | 2 (High) | `Interested in + to read` | Prepositions must be followed by a Gerund (V-ing). |
| **E_SVA_001** | Basic S-V Mismatch | 1 (Critical) | `He/She/It + V1` (no -s) | Add -s/-es for 3rd person singular in Present Simple. |
| **E_SVA_002** | Collective Noun Error | 2 (High) | `The government are...` | Usually use singular for collective organizations in IELTS. |
| **E_SVA_003** | Intervention Distraction | 1 (Critical) | `S1 + along with S2 + V(plural)` | Verb must agree with S1, not the intervening phrase. |
| **E_SVA_004** | Either/Neither Proximity | 2 (High) | `Neither S1 nor S2 + V(agrees with S1)` | Verb must agree with the closest subject (S2). |

## 2. CHI TIẾT LỖI GIỚI TỪ (E_VRB_005)
*   **Trigger:** AI phát hiện cấu trúc `Preposition + To + V`.
*   **Sai:** I am looking forward to **meet** you. (Lỗi cực nặng trong IELTS).
*   **Đúng:** I am looking forward to **meeting** you. (Ở đây 'to' là giới từ).

## 3. LOGIC XỬ LÝ (PRIORITY)
1.  **Syntax Hard Rules (E_VRB_002, E_VRB_004):** Ưu tiên sửa các lỗi sai cấu trúc cơ bản khiến câu không thể hiểu được.
2.  **Vocabulary-based Rules (E_VRB_001):** Đối chiếu với bộ từ điển động từ (Lexicon) để sửa dạng thức.
