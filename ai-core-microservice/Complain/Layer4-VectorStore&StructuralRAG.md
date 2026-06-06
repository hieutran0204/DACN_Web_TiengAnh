# Layer 4: Vector Store & Structural RAG (Discourse Skeleton Retrieval)

Layer 4 là tầng "Tri thức mẫu" của hệ thống TestKiller. Thay vì chỉ lưu trữ văn bản thô, tầng này lưu trữ các **Cấu trúc lập luận (Argumentation Skeletons)** của các bài luận mẫu Band 8.0+. Đây là nguồn dữ liệu đối chiếu để đưa ra các gợi ý Scaffolding Feedback.

## 🦴 1. Giải phẫu dữ liệu (Data Transformation)

Hệ thống không nạp dữ liệu thô. Mọi bài luận mẫu trước khi nạp vào Vector DB đều phải đi qua "Quy trình Giải phẫu":
*   **Trích xuất bộ xương**: Sử dụng Layer 1 & 2 để bóc tách mạch lập luận thành chuỗi quan hệ.
*   **Ví dụ**: Một đoạn văn được biến đổi từ `Text` thành `structure_path`: `CLAIM -> EXAMPLE -> CONSEQUENCE`.
*   **Content Representation**: Lưu trữ dưới dạng chuỗi giàu ngữ nghĩa: `[CLAIM] {Idea} -> [EXAMPLE] {Illustration} -> [CONSEQUENCE] {Result}`.

## 🧠 2. Vectorization & Embedding Strategy

*   **Mô hình nhúng**: Sử dụng các mô hình Transformer nhẹ (`all-MiniLM-L6-v2` hoặc `bge-small`) để tối ưu tốc độ search local.
*   **Không gian Vector**: Các Vector không chỉ đại diện cho ý nghĩa của từ, mà còn đại diện cho **Mạch logic**. Điều này cho phép hệ thống tìm kiếm được: *"Những cách triển khai ý tưởng tốt nhất khi bắt đầu bằng một luận điểm về Công nghệ là gì?"*

## 🔍 3. Cơ chế Truy xuất lúc Runtime (Structural Retrieval)

Khi học viên nộp bài, Layer 4 thực hiện quy trình So khớp (Matching):
1.  **Phân tích bài học viên**: Xác định "bộ xương" hiện tại của học viên (Ví dụ: `CLAIM -> CONTRADICTING_IDEA`).
2.  **Semantic Query**: Lấy `CLAIM` của học viên làm khóa truy vấn để tìm trong Vector DB những "bộ xương" Band 8 có cùng chủ đề và điểm bắt đầu tương tự.
3.  **Retrieval**: Lấy ra Top-k kết quả có cấu trúc lập luận chặt chẽ nhất.

## 💡 4. Contextual Reasoning (Suy luận ngữ cảnh)

Dữ liệu truy xuất từ Layer 4 được bơm vào Tầng Chấm điểm (Layer 5 - Macro) để AI thực hiện so sánh:
*   **Đối chiếu**: Bài học viên bị gãy ở đâu so với mẫu Band 8?
*   **Sinh Feedback**: Thay vì sửa lỗi ngữ pháp, hệ thống sẽ gợi ý: *"Để đạt Band 8, sau khi nêu Claim này, bạn nên đi tiếp theo hướng [EXAMPLE] thay vì đưa ra [CONTRADICTING_IDEA] ngay lập tức."*

## 🛠️ Lựa chọn Công nghệ (Tech Stack)

*   **ChromaDB**: Dành cho môi trường thử nghiệm và test cấu trúc lập luận nhanh.
*   **MongoDB Atlas Vector Search**: Lựa chọn ưu tiên cho Production để đồng bộ hóa database ứng dụng và vector store, giảm độ trễ và đơn giản hóa việc quản trị.
