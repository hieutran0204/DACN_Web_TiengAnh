# QUY TẮC CHẨN ĐOÁN LỖI TÍNH TỪ & TRẠNG TỪ (DIAGNOSTIC RULES)

---
metadata:
  complexity_level: "High"
  tags: ["AI_Logic", "Comparison_Errors", "Syntax"]
  related_to: ["comparison_overview.md", "adj_adv_basics.md"]
  version: "1.0"
---

## 1. RULE ENGINE SCHEMA

| Error Code | Rule Name | Priority | Trigger Pattern | Remedy / Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **E_CMP_001** | Short Adj with 'More' | 1 (Critical) | `more + [short_adj]` | Use 'adj + er' (e.g., faster, not more fast). |
| **E_CMP_002** | Long Adj with '-er' | 1 (Critical) | `[long_adj] + er` | Use 'more + adj' (e.g., more beautiful). |
| **E_CMP_003** | Missing 'The' (Superlative) | 2 (High) | `(No The) + [superlative]` | Add 'The' before superlative forms. |
| **E_CMP_004** | Double Comparison Syntax | 2 (High) | `More... more... (No 'The')` | Use 'The more... the more...' structure. |
| **E_ADV_001** | Adj for Adv | 1 (Critical) | `Verb + [Adjective]` | Use an adverb to describe an action (e.g., run slowly). |
| **E_ADV_002** | Good vs Well | 2 (High) | `He plays good.` | 'Good' is an adjective; 'Well' is an adverb. |

## 2. CHI TIẾT LỖI TÍNH TỪ NGẮN/DÀI (E_CMP_001, E_CMP_002)
*   **Trigger:** AI đối chiếu số âm tiết của tính từ để xác định cách chia.
*   **Sai:** This car is **more cheap** than that one.
*   **Đúng:** This car is **cheaper** than that one.

## 3. LỖI SO SÁNH KÉP (E_CMP_004)
*   **Sai:** More I study, more I learn.
*   **Đúng:** **The more** I study, **the more** I learn.
*   **AI Insight:** "Cấu trúc so sánh kép bắt buộc phải có mạo từ 'The' ở cả hai vế."
