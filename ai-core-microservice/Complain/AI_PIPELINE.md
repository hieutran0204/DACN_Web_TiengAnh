# 🤖 AI GraphRAG Pipeline Overview

Tài liệu này mô tả luồng xử lý thông minh (Pipeline) của hệ thống **English Learning Assistant**. Hệ thống không chỉ sử dụng AI đơn thuần mà kết hợp kỹ thuật **GraphRAG** (Knowledge Graph + Retrieval Augmented Generation) để cá nhân hóa việc học.

---

## 🔄 Quy trình xử lý (Pipeline Flow)

Hệ thống hoạt động theo 7 bước khép kín:

### 1. 🔵 Truy vấn Vector (Vector Retrieval)
*   **Mục tiêu**: Tìm kiếm kiến thức chuyên môn về IELTS (Band Descriptors, mẹo làm bài).
*   **Hành động**: Chuyển bài viết của người dùng thành Vector và tìm các đoạn văn bản liên quan nhất trong Vector Database (Milvus/Pinecone/Chroma).

### 2. 🟣 Truy vấn Đồ thị (Graph Retrieval)
*   **Mục tiêu**: Lấy "trí nhớ" của AI về người dùng đó.
*   **Hành động**: Truy cập vào **Neo4j** để lấy danh sách các lỗi sai thường gặp (Recurring Errors) và các điểm mạnh của học sinh đó từ các bài làm trước.

### 3. 🧩 Xây dựng ngữ cảnh (Context Builder)
*   **Hành động**: Kết hợp dữ liệu từ Bước 1 (Kiến thức chuẩn) và Bước 2 (Lịch sử người dùng) thành một khối dữ liệu ngữ cảnh (Context) duy nhất.

### 4. 💉 Tiêm ngữ cảnh (Prompt Injection)
*   **Hành động**: Đưa toàn bộ ngữ cảnh ở trên vào một bản hướng dẫn (Prompt) cực kỳ chi tiết dành cho AI (Examiner Band 9.0).
*   **Kết quả**: AI sẽ chấm bài dựa trên cả tiêu chuẩn IELTS lẫn lịch sử lỗi sai của riêng bạn.

### 5. 🤖 Gọi mô hình ngôn ngữ (LLM Call)
*   **Hệ thống hỗ trợ**: Google Gemini (Flash/Pro) hoặc Ollama (DeepSeek/Qwen).
*   **Hành động**: AI thực hiện chấm điểm, sửa lỗi và đưa ra lời khuyên dưới dạng cấu trúc JSON.

### 6. 🔺 Trích xuất bộ ba (Triplet Extraction)
*   **Mục tiêu**: Biến dữ liệu văn bản thành dữ liệu đồ thị.
*   **Hành động**: Tự động phân tích kết quả trả về để tìm ra: `Học sinh` -> `Mắc lỗi` -> `Lỗi A`.

### 7. 🧱 Cập nhật bộ nhớ (Graph Update)
*   **Hành động**: Lưu các lỗi mới phát hiện vào **Neo4j**. 
*   **Kết quả**: Lần sau bạn làm bài, AI sẽ "nhớ" những lỗi này để nhắc nhở (Vòng lặp hoàn tất).

---

## 📚 Hệ thống từ điển thông minh (Dictionary Scraping)
Ngoài luồng chính, hệ thống còn có một nhánh phụ đang được xây dựng:
*   **Scraper**: Cào dữ liệu từ API từ điển (Free Dictionary API).
*   **Neo4j Ingestion**: Nạp từ vựng vào đồ thị để xây dựng mối quan hệ giữa các từ (Đồng nghĩa, Trái nghĩa, Loại từ).
*   **Mục tiêu**: Giúp AI giải thích từ vựng cho người dùng một cách chính xác và có hệ thống hơn.

---

## 🛠 Công nghệ sử dụng
| Thành phần | Công nghệ |
| :--- | :--- |
| **Orchestration** | Node.js (Express) |
| **LLM** | Google Gemini 1.5/2.0 Flash |
| **Graph DB** | Neo4j (Cypher Query) |
| **Vector DB** | LangChain Vector Stores |
| **Automation** | Python (Scraping & Data Processing) |
