# RÀNG BUỘC NGỮ NGHĨA VỀ THÌ (TENSE SEMANTIC CONSTRAINTS)

---
metadata:
  complexity_level: "High"
  tags: ["Timeline", "Logic", "Context"]
  related_to: ["diagnostic_rules.md"]
---

Giúp AI "nhìn" thấy trục thời gian để tư vấn thì đúng nhất theo ngữ cảnh bài viết.

## 1. TRỤC THỜI GIAN (THE TIMELINE)

### A. Point in Time (Thời điểm xác định)
*   **Logic:** Nếu hành động đã kết thúc và có thời điểm rõ ràng -> **Past Simple**.
*   **AI Insight:** "Bạn đã dùng 'In 2010', hệ thống yêu cầu thì Quá khứ đơn thay vì Hiện tại hoàn thành."

### B. Period up to Now (Khoảng thời gian kéo dài đến hiện tại)
*   **Logic:** Nếu hành động bắt đầu trong quá khứ và vẫn còn liên quan/kéo dài đến nay -> **Present Perfect**.
*   **AI Insight:** "Hành động này bắt đầu từ quá khứ và vẫn đang tiếp diễn, hãy dùng 'Present Perfect Continuous' để nhấn mạnh tính liên tục."

## 2. QUY TẮC PHỐI HỢP THÌ (TENSE SEQUENCE)
AI cần kiểm tra tính logic giữa các mệnh đề trong câu:
*   **While/As:** Thường đi kèm một hành động đang xảy ra (Continuous) cắt ngang bởi một hành động khác (Simple).
*   **Before/After:** Hành động xảy ra trước trong quá khứ phải dùng **Past Perfect**.
    * *Pattern:* `Had + V3 (Action 1) before V2 (Action 2)`.

## 3. STATE VS ACTION (NGỮ NGHĨA ĐỘNG TỪ)
Phân loại động từ để tránh lỗi Continuous:
*   **State Verbs:** *understand, believe, belong, depend, contain...*
    * -> `Constraint: Continuous_Forbidden`
*   **Action Verbs:** *run, work, write...*
    * -> `Constraint: Continuous_Allowed`
