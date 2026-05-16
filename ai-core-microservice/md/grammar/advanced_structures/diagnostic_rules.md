# QUY TẮC CHẨN ĐOÁN LỖI CẤU TRÚC NÂNG CAO (DIAGNOSTIC RULES)

---
metadata:
  complexity_level: "High"
  tags: ["AI_Logic", "Inversion_Errors", "Parallelism_Errors"]
  related_to: ["inversion_general.md", "parallel_structure.md"]
  version: "1.0"
---

## 1. RULE ENGINE SCHEMA

| Error Code | Rule Name | Priority | Trigger Pattern | Remedy / Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **E_ADV_001** | Inversion Without Auxiliary | 1 (Critical) | `Negative_Adv + S + V` | Use 'Adv + Auxiliary + S + V' (e.g., Never have I...). |
| **E_ADV_002** | No Sooner ... When | 1 (Critical) | `No sooner ... when` | Use 'No sooner ... THAN'. |
| **E_ADV_003** | Parallelism Mismatch | 2 (High) | `List with inconsistent forms` | Maintain the same grammatical form in a list. |
| **E_ADV_004** | Cleft Sentence Is/Are | 3 (Medium) | `It are...` | 'It' in cleft sentences always takes 'is' or 'was'. |
| **E_ADV_005** | Auxiliary Do with -s/-ed | 2 (High) | `Did finished` or `Does works` | Use bare infinitive (V1) after do/does/did. |

## 2. CHI TIẾT LỖI CẤU TRÚC SONG SONG (E_ADV_003)
*   **Trigger:** AI phân tích từ loại của các thành phần trong cụm nối bởi *and/but/or*.
*   **Sai:** Governments should focus on **education**, **health**, and **improving** the economy.
*   **Đúng:** Governments should focus on **education**, **health**, and the **economy**. (Noun, Noun, Noun).

## 3. LỖI ĐẢO NGỮ (E_ADV_001)
*   **Sai:** Never I have seen...
*   **Đúng:** Never **have I** seen...
*   **AI Insight:** "Khi đưa trạng từ phủ định lên đầu câu, bạn bắt buộc phải đảo trợ động từ lên trước chủ ngữ."
