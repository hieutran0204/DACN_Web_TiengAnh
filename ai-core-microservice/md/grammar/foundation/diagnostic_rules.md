# QUY TẮC CHẨN ĐOÁN LỖI NỀN TẢNG (DIAGNOSTIC RULES)

---
metadata:
  complexity_level: "High"
  tags: ["AI_Logic", "Syntax_Check", "Validation"]
  related_to: ["word_order.md", "sentence_structure.md"]
  version: "1.0"
---

## 1. RULE ENGINE SCHEMA

| Error Code | Rule Name | Priority | Trigger Pattern | Remedy / Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **E_FOU_001** | Missing Main Verb | 1 (Critical) | `Subject + (No Finite Verb) + .` | A sentence must have a main verb. |
| **E_FOU_002** | Adjective Order | 2 (High) | `Wrong OSASCOMP sequence` | Follow Opinion-Size-Age... order. |
| **E_FOU_003** | Adverb Placement | 2 (High) | `Adverb between Verb & Object` | Do not put adverbs between V and O. |
| **E_FOU_004** | Run-on Sentence | 1 (Critical) | `Clause + Clause (No connector)` | Use a comma + conjunction or a semicolon. |
| **E_FOU_005** | Missing Subject | 1 (Critical) | `Verb + Object (No Subject)` | Every sentence (except imperatives) needs a S. |

## 2. CHI TIẾT LỖI VỊ TRÍ TRẠNG TỪ (E_FOU_003)
*   **Trigger:** AI phát hiện cấu trúc `Verb + Adverb + Object`.
*   **Sai:** I like **very much** English.
*   **Đúng:** I like English **very much**.
*   **AI Insight:** "Trạng từ không được đứng giữa động từ và tân ngữ trực tiếp."

## 3. LỖI CÂU CHẠY (RUN-ON - E_FOU_004)
*   **Trigger:** Hai câu độc lập nối với nhau chỉ bằng dấu phẩy.
*   **Sai:** I am a student, I study hard.
*   **Đúng:** I am a student**, and** I study hard. / I am a student**;** I study hard.
