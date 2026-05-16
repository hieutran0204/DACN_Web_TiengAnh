content_continuous = """# THÌ HIỆN TẠI TIẾP DIỄN (PRESENT CONTINUOUS TENSE)

Dựa trên nội dung sách "Giải thích ngữ pháp tiếng Anh" - Mai Lan Hương & Hà Thanh Uyên.

---

## 1. CÔNG THỨC (FORM)

* **Khẳng định:** $S + \text{am/is/are} + V\text{-ing} + \dots$
* **Phủ định:** $S + \text{am/is/are} + \text{not} + V\text{-ing} + \dots$
* **Nghi vấn:** $\text{Am/Is/Are} + S + V\text{-ing} + \dots?$
    * *Trả lời:* Yes, $S + \text{am/is/are}.$ / No, $S + \text{am/is/are} + \text{not}.$

**Lưu ý về chủ ngữ:**
- $I + \text{am}$
- $He/She/It/Danh\ từ\ số\ ít + \text{is}$
- $You/We/They/Danh\ từ\ số\ nhiều + \text{are}$

---

## 2. CÁCH DÙNG (USAGE)

1.  **Diễn tả một hành động đang xảy ra tại thời điểm nói.**
    * *Ví dụ:* We are learning English now. (Bây giờ chúng tôi đang học tiếng Anh).
2.  **Diễn tả một hành động đang xảy ra xung quanh thời điểm nói (mang tính chất tạm thời), dù không nhất thiết phải ngay lúc nói.**
    * *Ví dụ:* I am reading an interesting book this week. (Tuần này tôi đang đọc một cuốn sách rất hay).
3.  **Diễn tả một hành động sắp xảy ra trong tương lai gần (thường là một kế hoạch, dự định đã được sắp xếp trước).**
    * *Ví dụ:* He is flying to Hanoi tomorrow. (Ngày mai anh ấy sẽ bay ra Hà Nội).
4.  **Dùng với trạng từ "ALWAYS" để diễn tả sự phàn nàn, bực mình về một thói quen xấu lặp đi lặp lại.**
    * *Ví dụ:* You are always losing your keys! (Cậu lúc nào cũng làm mất chìa khóa hết!).

---

## 3. QUY TẮC THÊM "-ING" VÀO SAU ĐỘNG TỪ

1.  **Động từ tận cùng bằng "e" đơn:** Bỏ "e" rồi thêm "-ing".
    * *Ví dụ:* write $\rightarrow$ writing, change $\rightarrow$ changing.
    * *Ngoại lệ:* Tận cùng bằng "ee" thì giữ nguyên: see $\rightarrow$ seeing.
2.  **Động từ 1 âm tiết, tận cùng là "1 nguyên âm + 1 phụ âm"** (trừ *w, x, y*): Gấp đôi phụ âm cuối rồi thêm "-ing".
    * *Ví dụ:* run $\rightarrow$ running, sit $\rightarrow$ sitting, plan $\rightarrow$ planning.
3.  **Động từ 2 âm tiết, có trọng âm rơi vào âm tiết thứ 2:** Gấp đôi phụ âm cuối rồi thêm "-ing".
    * *Ví dụ:* begin $\rightarrow$ beginning, prefer $\rightarrow$ preferring.
4.  **Động từ tận cùng bằng "ie":** Đổi "ie" thành "y" rồi thêm "-ing".
    * *Ví dụ:* die $\rightarrow$ dying, lie $\rightarrow$ lying.

---

## 4. DẤU HIỆU NHẬN BIẾT (SIGNALS)

* **Trạng từ chỉ thời gian:** *Now (bây giờ), Right now (ngay bây giờ), At the moment (lúc này), At present (hiện tại), At + giờ cụ thể (At 12 o'clock)...*
* **Cụm từ chỉ thời gian tạm thời:** *This week, this month, these days...*
* **Các động từ gây chú ý (mệnh lệnh thức) đứng đầu câu:**
    * *Look!* (Nhìn kìa!) $\rightarrow$ Look! The bus is coming.
    * *Listen!* (Nghe kìa!) $\rightarrow$ Listen! Someone is singing.
    * *Keep silent!* (Hãy giữ trật tự!)

---

## *LƯU Ý QUAN TRỌNG: ĐỘNG TỪ TRẠNG THÁI (STATIVE VERBS)*
Không dùng thì Hiện tại tiếp diễn với các động từ chỉ trạng thái, cảm xúc, nhận thức dưới đây (thay vào đó phải dùng thì Hiện tại đơn):
* **Chỉ suy nghĩ, nhận thức:** *know, understand, believe, remember, forget, mean...*
* **Chỉ cảm xúc:** *love, like, hate, dislike, want, wish, prefer...*
* **Chỉ sở hữu:** *have (khi nghĩa là có), own, belong to...*
* **Chỉ giác quan:** *see, hear, smell, taste, feel...*
"""

with open('present_continuous.md', 'w', encoding='utf-8') as f:
    f.write(content_continuous)

print("File 'present_continuous.md' đã được tạo thành công.")