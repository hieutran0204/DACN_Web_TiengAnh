# RÀNG BUỘC NGỮ NGHĨA (SEMANTIC CONSTRAINTS)

---
metadata:
  complexity_level: "High"
  tags: ["Logic", "Reasoning", "Context"]
  related_to: ["diagnostic_rules.md", "ielts_usage.md"]
---

File này giúp AI "suy luận" để chọn loại câu điều kiện phù hợp dựa trên ngữ cảnh (Contextual Reasoning).

## 1. PHÂN BIỆT REAL VS HYPOTHETICAL
Hệ thống cần xác định tính xác thực của mệnh đề If (Fact-check):
*   **Fact:** "I am a student."
    * -> Nếu giả định: `If I were a teacher...` (Loại 2).
*   **Possibility:** "It might rain tomorrow."
    * -> Nếu giả định: `If it rains...` (Loại 1).

## 2. TRỤC THỜI GIAN (TIMELINE MAPPING)
AI dựa vào các "Time Tokens" để xác định loại câu:
*   **Tokens [Now, Today, Currently]:** Ưu tiên Loại 1 hoặc Loại 2.
*   **Tokens [Yesterday, In 2010, Last year]:** Ưu tiên Loại 3.
*   **Tokens [All the time, Always]:** Ưu tiên Loại 0.

## 3. LOGIC CỦA CÂU HỖN HỢP (MIXED LOGIC)
AI cần nhận diện các cặp nguyên nhân - kết quả xuyên thời gian:
*   **Pattern A:** Quá khứ ảnh hưởng Hiện tại (`had V3` -> `would V1`).
    * *Dấu hiệu:* "If I had studied (past), I would know the answer now (present)."
*   **Pattern B:** Bản chất (Hiện tại) ảnh hưởng Quá khứ (`V2` -> `would have V3`).
    * *Dấu hiệu:* "If I were smart (general/present), I would have solved it yesterday (past)."

## 4. CHIẾN LƯỢC TƯ VẤN (COACHING LOGIC)
Nếu người dùng viết câu Loại 1 nhưng ngữ cảnh là "Impossible", AI sẽ gợi ý:
*   *"Sự việc này khó có thể xảy ra ở hiện tại, bạn nên dùng cấu trúc Loại 2 (If + V2, would + V1) để diễn đạt tính giả định chính xác hơn."*
