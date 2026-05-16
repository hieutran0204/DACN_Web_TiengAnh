content = """# THÌ HIỆN TẠI ĐƠN (PRESENT SIMPLE TENSE)

Dựa trên nội dung sách "Giải thích ngữ pháp tiếng Anh" - Mai Lan Hương & Hà Thanh Uyên.

---

## 1. CÔNG THỨC (FORM)

### A. Với Động từ To be (am/is/are)
* **Khẳng định:** $S + \text{am/is/are} + \dots$
* **Phủ định:** $S + \text{am/is/are} + \text{not} + \dots$
* **Nghi vấn:** $\text{Am/Is/Are} + S + \dots?$
    * *Trả lời:* Yes, $S + \text{am/is/are}.$ / No, $S + \text{am/is/are} + \text{not}.$

**Lưu ý:**
- $I + \text{am}$
- $He/She/It/Danh\ từ\ số\ ít + \text{is}$
- $You/We/They/Danh\ từ\ số\ nhiều + \text{are}$

### B. Với Động từ thường (Ordinary Verbs)
* **Khẳng định:** $S + V_1(s/es) + \dots$
* **Phủ định:** $S + \text{do/does} + \text{not} + V\text{ (nguyên mẫu)} + \dots$
* **Nghi vấn:** $\text{Do/Does} + S + V\text{ (nguyên mẫu)} + \dots?$
    * *Trả lời:* Yes, $S + \text{do/does}.$ / No, $S + \text{do/does} + \text{not}.$

**Lưu ý:**
- $I/You/We/They/Danh\ từ\ số\ nhiều + V\text{ (nguyên mẫu)} \rightarrow$ Mượn trợ động từ **Do**.
- $He/She/It/Danh\ từ\ số\ ít + V_{s/es} \rightarrow$ Mượn trợ động từ **Does**.

---

## 2. CÁCH DÙNG (USAGE)

1.  **Diễn tả một chân lý, một sự thật hiển nhiên.**
    * *Ví dụ:* The sun rises in the East. (Mặt trời mọc ở hướng Đông).
2.  **Diễn tả một thói quen, một hành động xảy ra thường xuyên ở hiện tại.**
    * *Ví dụ:* I usually get up at 6.00. (Tôi thường ngủ dậy lúc 6 giờ).
3.  **Diễn tả năng lực của con người.**
    * *Ví dụ:* He plays badminton very well. (Anh ấy chơi cầu lông rất giỏi).
4.  **Diễn tả một kế hoạch đã được sắp xếp trong tương lai (lịch trình, thời khóa biểu).**
    * *Ví dụ:* The train leaves at 7.00 am tomorrow. (Tàu rời ga lúc 7 giờ sáng mai).

---

## 3. QUY TẮC THÊM "S" HOẶC "ES" VÀO SAU ĐỘNG TỪ
Khi chủ ngữ là ngôi thứ 3 số ít ($He/She/It/Danh\ từ\ số\ ít$):

1.  **Thêm "es"** vào các động từ kết thúc bằng: **-o, -s, -ch, -x, -sh, -z** (Câu thần chú: *Ông Sáu Chạy Xe Sh Zỏm*).
    * *Ví dụ:* watch $\rightarrow$ watches, go $\rightarrow$ goes.
2.  **Động từ kết thúc bằng "y":**
    * Nếu trước "y" là một phụ âm: đổi "y" thành "i" rồi thêm "es". (*Ví dụ:* study $\rightarrow$ studies).
    * Nếu trước "y" là một nguyên âm ($a, e, i, o, u$): giữ nguyên "y" và thêm "s". (*Ví dụ:* play $\rightarrow$ plays).
3.  **Các trường hợp còn lại:** Thêm "s".

---

## 4. DẤU HIỆU NHẬN BIẾT (SIGNALS)

* **Trạng từ chỉ tần suất:** *Always, usually, often, sometimes, frequently, seldom, rarely, never...*
* **Every + danh từ thời gian:** *Every day, every week, every month, every year...*
* **Cụm từ chỉ tần suất:** *Once a week, twice a month, three times a year...*
"""

with open('present_simple.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("File 'present_simple.md' đã được tạo thành công.")