# Common Logical Errors & Fallacies in IELTS Writing

Hệ thống AI cần nhận diện các lỗi tư duy này để cảnh báo người dùng trong phần Coherence & Cohesion (Band 5.0 - 6.0 thường mắc phải).

## 1. Circular Reasoning (Lập luận vòng quanh)
*   **Định nghĩa:** Lặp lại luận điểm bằng cách dùng từ ngữ khác mà không đưa ra bằng chứng thực tế.
*   **Example:** "Technology is beneficial because it helps people and provides many advantages." (Câu sau chỉ lặp lại ý 'beneficial' mà không giải thích lợi ích cụ thể là gì).
*   **AI Scaffolding Suggestion:** "Luận điểm của bạn đang bị lặp lại ý tưởng cũ. Hãy thử đưa ra một ví dụ cụ thể (ví dụ: giúp tiết kiệm thời gian, tăng hiệu suất công việc) để chứng minh thay vì chỉ nói nó 'có lợi'."

## 2. Overgeneralization (Vơ đũa cả nắm)
*   **Định nghĩa:** Dùng các từ tuyệt đối như *always, never, all, everyone* cho các vấn đề phức tạp.
*   **Example:** "All students spend too much time on social media."
*   **AI Scaffolding Suggestion:** "Hãy dùng các từ hạn định (hedging) như *tend to, in many cases, a majority of* để lập luận khách quan và thuyết phục hơn."

## 3. Post Hoc Ergo Propter Hoc (Lỗi nhân quả sai lệch)
*   **Định nghĩa:** Giả định rằng vì sự việc B xảy ra sau A, nên A là nguyên nhân của B.
*   **Example:** "The number of cars increased, and then crime rates rose. Therefore, cars cause crime."
*   **AI Scaffolding Suggestion:** "Mối quan hệ nhân quả này chưa thực sự logic. Hãy bổ sung thêm các bước trung gian hoặc bằng chứng để kết nối hai sự việc này chặt chẽ hơn."

## 4. Sudden Logic Jumps (Nhảy cóc luận điểm)
*   **Định nghĩa:** Đưa ra kết luận mà không có các bước dẫn dắt trung gian.
*   **AI Graph Logic:** Quét các Node trong Lexical Chain. Nếu Node hiện tại không liên quan đến Node trước đó về mặt ngữ nghĩa (Semantic Distance > 0.8) mà không có từ nối chuyển ý -> Flag `[LOGIC_JUMP]`.
