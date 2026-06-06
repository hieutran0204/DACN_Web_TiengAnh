# Layer 3: Knowledge Graph & Argumentation Analysis

Đây là tầng cao nhất trong hệ thống xử lý GraphRAG của TestKiller. Nhiệm vụ cốt lõi là biến đổi chuỗi văn bản tuyến tính thành một **Đồ thị Lập luận (Argumentation Graph)** và thực hiện các phép kiểm chứng logic toán học để hỗ trợ chấm điểm vĩ mô.

## 🏛️ 1. Thăng hạng thực thể (Entity Promotion & State Machine)

Sau khi Layer 1 & 2 hoàn tất việc lưu trữ thô, Layer 3 thực hiện quy trình "Thăng hạng nhãn" (Label Promotion) để xác định bản chất thực thể trong đồ thị:

*   **`(:Claim)`**: Được thăng hạng từ các câu có vai trò `topic_sentence` hoặc `claim`. Đây là các Node "gốc" chứa luận điểm chính.
*   **`(:Evidence)`**: Được thăng hạng từ `supporting_detail`. Đây là các Node mang tính lý lẽ để củng cố cho Claim.
*   **`(:Example)`**: Được thăng hạng từ `example`. Đây là các Node mang tính minh họa thực tế.
*   **`(:DiscourseMarker)`**: Các từ nối bóc tách được sẽ tạo thành các Node độc lập để định hướng luồng logic.

## 🔗 2. Kiến tạo Quan hệ Semantic (Semantic Relations)

Layer 3 tự động thiết lập các mối quan hệ logic dựa trên cấu trúc văn bản:
*   **`[:SUPPORTS]`**: Nối từ `Evidence` -> `Claim` hoặc `Example` -> `Evidence`. Đây là xương sống của mạch lập luận.
*   **`[:USES_MARKER]`**: Nối từ câu văn đến từ nối tương ứng để xác định phương thức chuyển ý.
*   **`[:NEXT_SENTENCE]`**: Duy trì luồng đọc tuyến tính của bài viết.

## 🔍 3. Kiểm chứng Logic Toán học (Deterministic Logic Verification)

Khác với các hệ thống AI thông thường chỉ "đoán" lỗi, Layer 3 sử dụng thuật toán đồ thị để **chứng minh** lỗi:

1.  **Logic Jump Detection (Cosine Similarity)**:
    *   Sử dụng tích vô hướng (Dot Product) và Magnitude của các Vector Embedding để tính khoảng cách ngữ nghĩa giữa 2 câu liên tiếp.
    *   Nếu Similarity < 0.45 và không có từ nối chuyển ý $\rightarrow$ Gắn cờ `LOGIC_JUMP`.
2.  **Structural Flaw Detection**:
    *   Sử dụng Cypher Query để tìm các mẫu hình lập luận sai: Ví dụ đưa ra 2 `Claim` liên tiếp mà không có `Evidence` bổ trợ $\rightarrow$ Gắn cờ `REPETITIVE_CLAIM`.

## 🧠 4. Cơ chế Hybrid RAG Injection (Bridge to Macro AI)

Layer 3 cung cấp "Mạch tri thức" cho con AI chấm điểm vĩ mô thông qua hàm `getArgumentationGraphContext`:
*   **Input**: Đồ thị thực thể trên Neo4j.
*   **Output**: Một chuỗi văn bản mô tả sơ đồ tư duy: *"Câu 1 [Claim] được hỗ trợ bởi Câu 2 [Evidence]..."*
*   **Tác dụng**: Giúp LLM nhìn thấy được cấu trúc lập luận thực tế để đưa ra nhận xét **Scaffolding Feedback** có chiều sâu thay vì chỉ nhận xét chung chung.

## 🛡️ 5. Tính toàn vẹn dữ liệu (Data Integrity)

*   **Cleanup on start**: Tự động xóa sạch cấu trúc cũ của cùng một `essayId` trước khi tái thiết để chống trùng lặp Node.
*   **State remap**: Gỡ bỏ nhãn `Sentence` ngay sau khi thăng hạng để giữ đồ thị luôn ở trạng thái "sạch" nhất.
