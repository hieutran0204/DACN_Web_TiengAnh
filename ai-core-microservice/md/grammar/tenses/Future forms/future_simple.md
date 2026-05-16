content_future_simple = """# THÌ TƯƠNG LAI ĐƠN (FUTURE SIMPLE TENSE)

Dựa trên nội dung sách "Giải thích ngữ pháp tiếng Anh" - Mai Lan Hương & Hà Thanh Uyên.

---

## 1. CÔNG THỨC (FORM)

* **Khẳng định:** $S + \text{will} + V\text{ (nguyên mẫu)} + \dots$
* **Phủ định:** $S + \text{will} + \text{not} + V\text{ (nguyên mẫu)} + \dots$ (Viết tắt: $\text{will not} \rightarrow \text{won't}$)
* **Nghi vấn:** $\text{Will} + S + V\text{ (nguyên mẫu)} + \dots?$
    * *Trả lời:* Yes, $S + \text{will}.$ / No, $S + \text{won't}.$

**Lưu ý:** 
- Trong tiếng Anh trang trọng, **Shall** có thể dùng cho ngôi thứ nhất ($I/We$). Tuy nhiên, tiếng Anh hiện đại ngày nay ưu tiên dùng **Will** cho tất cả các ngôi.

---

## 2. CÁCH DÙNG (USAGE)

1.  **Diễn tả một quyết định, ý định nảy sinh ngay tại thời điểm nói (không có dự định trước).**
    * *Ví dụ:* It's raining. I **will take** an umbrella. (Trời đang mưa. Tớ sẽ cầm theo ô - quyết định tức thời).
2.  **Diễn tả một dự đoán không có căn cứ xác thực ở hiện tại (chỉ là suy đoán chủ quan).**
    * *Ví dụ:* I think it **will rain** tomorrow. (Tớ nghĩ ngày mai trời sẽ mưa).
3.  **Dùng trong các lời hứa, lời đề nghị, lời đe dọa hoặc lời yêu cầu.**
    * *Lời hứa:* I **will help** you with your homework. (Tớ sẽ giúp cậu làm bài tập).
    * *Lời đề nghị:* **Will** you **have** a cup of tea? (Cậu uống một tách trà chứ?)
4.  **Dùng trong câu điều kiện loại 1 (diễn tả sự việc có thể xảy ra ở hiện tại hoặc tương lai).**
    * *Cấu trúc:* If + $S + V\text{ (hiện tại đơn)}$, $S + \text{will} + V\text{ (nguyên mẫu)}$.
    * *Ví dụ:* If it is sunny, we **will go** for a picnic. (Nếu trời nắng, chúng tớ sẽ đi dã ngoại).

---

## 3. DẤU HIỆU NHẬN BIẾT (SIGNALS)

* **Trạng từ chỉ thời gian trong tương lai:**
    * *Tomorrow* (ngày mai).
    * *Next week / next month / next year...* (tuần tới/tháng tới/năm tới).
    * *In + khoảng thời gian trong tương lai* (In 2 days: trong 2 ngày nữa).
    * *Soon* (sớm thôi).
* **Các động từ chỉ quan điểm, suy nghĩ (thường đi kèm làm căn cứ đưa ra dự đoán):**
    * *Think* (nghĩ), *believe* (tin), *suppose* (cho là), *assume* (giả định)...
    * *Hope* (hy vọng), *expect* (mong đợi)...
* **Các trạng từ chỉ khả năng:**
    * *Perhaps / Probably / Maybe* (có lẽ, có thể).

---

## 4. PHÂN BIỆT NHANH: WILL (TƯƠNG LAI ĐƠN) & BE GOING TO (TƯƠNG LAI GẦN)

Sách cô Mai Lan Hương phân biệt rất rõ hai cấu trúc này để tránh làm bài tập bị bẫy:

| Điểm so sánh | Will (Tương lai đơn) | Be going to (Tương lai gần) |
| :--- | :--- | :--- |
| **Kế hoạch trước** | **Không có**. Quyết định đưa ra bột phát ngay lúc nói. | **Có dự định sẵn** từ trước thời điểm nói. |
| **Căn cứ dự đoán** | **Suy đoán chủ quan**, không có bằng chứng ở hiện tại. | **Dự đoán dựa trên bằng chứng, dấu hiệu** thấy rõ ở hiện tại. |
| **Ví dụ** | "We are out of milk." -> "Oh, I **will go** and buy some." (Quyết định đi mua ngay lúc biết hết sữa). | "Look at those black clouds! It **is going to rain**." (Dự đoán trời mưa vì thấy mây đen kéo đến). |
"""

with open('future_simple.md', 'w', encoding='utf-8') as f:
    f.write(content_future_simple)

print("File 'future_simple.md' đã được tạo thành công.")