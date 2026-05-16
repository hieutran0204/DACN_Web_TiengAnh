content_perfect = """# THÌ HIỆN TẠI HOÀN THÀNH (PRESENT PERFECT TENSE)

Dựa trên nội dung sách "Giải thích ngữ pháp tiếng Anh" - Mai Lan Hương & Hà Thanh Uyên.

---

## 1. CÔNG THỨC (FORM)

* **Khẳng định:** $S + \text{have/has} + V_3/V\text{-ed} + \dots$
* **Phủ định:** $S + \text{have/has} + \text{not} + V_3/V\text{-ed} + \dots$
* **Nghi vấn:** $\text{Have/Has} + S + V_3/V\text{-ed} + \dots?$
    * *Trả lời:* Yes, $S + \text{have/has}.$ / No, $S + \text{have/has} + \text{not}.$

**Lưu ý về chủ ngữ:**
- $I/You/We/They/Danh\ từ\ số\ nhiều + \text{have}$ (Viết tắt phủ định: *haven't*)
- $He/She/It/Danh\ từ\ số\ ít + \text{has}$ (Viết tắt phủ định: *hasn't*)

---

## 2. CÁCH DÙNG (USAGE)

1.  **Diễn tả hành động vừa mới xảy ra.** (Thường đi với *just, already*).
    * *Ví dụ:* I have just finished my homework. (Tôi vừa mới làm xong bài tập về nhà).
2.  **Diễn tả hành động đã xảy ra trong quá khứ khi không biết rõ thời gian hoặc không muốn đề cập đến thời gian cụ thể.**
    * *Ví dụ:* She has lost her key. (Cô ấy đã bị mất chìa khóa rồi - không rõ mất lúc nào).
3.  **Diễn tả hành động bắt đầu ở quá khứ, kéo dài đến hiện tại và có thể tiếp tục ở tương lai.** (Thường đi với *since, for*).
    * *Ví dụ:* We have lived here for 10 years. (Chúng tôi đã sống ở đây được 10 năm rồi).
4.  **Diễn tả hành động đã xảy ra nhiều lần (lặp đi lặp lại) tính đến thời điểm hiện tại.**
    * *Ví dụ:* I have seen this movie three times. (Tôi đã xem bộ phim này 3 lần rồi).
5.  **Diễn tả kinh nghiệm hay trải nghiệm tính đến hiện tại.** (Thường dùng trong câu hỏi với *ever* hoặc câu phủ định với *never*).
    * *Ví dụ:* Have you ever been to Paris? (Cậu đã từng đến Paris chưa?).

---

## 3. QUY TẮC BIẾN ĐỔI ĐỘNG TỪ ($V_3/V\text{-ed}$)

* **Động từ có quy tắc (Regular Verbs):** Thêm đuôi "-ed" vào sau động từ (quy tắc thêm tương tự thì Quá khứ đơn).
    * *Ví dụ:* watch $\rightarrow$ watched, live $\rightarrow$ lived, study $\rightarrow$ studied.
* **Động từ bất quy tắc (Irregular Verbs):** Sử dụng động từ ở **Cột 3 (V3)** trong bảng động từ bất quy tắc.
    * *Ví dụ:* go $\rightarrow$ went $\rightarrow$ **gone**, see $\rightarrow$ saw $\rightarrow$ **seen**, do $\rightarrow$ did $\rightarrow$ **done**.

---

## 4. DẤU HIỆU NHẬN BIẾT & VỊ TRÍ CÁC TRẠNG TỪ (SIGNALS)

* **Since + mốc thời gian:** Kể từ khi (Since 2010, since last week, since Monday).
* **For + khoảng thời gian:** Trong vòng (For 5 years, for a long time, for 2 months).
* **Just / Already / Never / Ever:** Đứng **sau** *have/has* và **trước** *V3/-ed*.
    * *Just:* Vừa mới.
    * *Already:* Đã... rồi (Dùng trong câu khẳng định).
    * *Never:* Chưa bao giờ.
    * *Ever:* Đã từng (Dùng trong câu hỏi).
* **Yet:** Chưa (Dùng ở **cuối câu** phủ định hoặc nghi vấn).
    * *Ví dụ:* I haven't eaten lunch **yet**.
* **Recently / Lately / So far / Up to now / Up to the present:** Gần đây, cho đến nay (Thường đứng đầu hoặc cuối câu).
* **In/Over/During + the past/last + khoảng thời gian:** Trong vòng... qua (In the past 3 years: Trong 3 năm qua).
* **Đây là lần đầu tiên/thứ hai... làm gì:** 
    * *Cấu trúc:* It is the first/second time + $S + \text{have/has} + V_3/-ed$.
"""

with open('present_perfect.md', 'w', encoding='utf-8') as f:
    f.write(content_perfect)

print("File 'present_perfect.md' đã được tạo thành công.")