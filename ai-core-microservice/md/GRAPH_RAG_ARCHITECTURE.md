# 🧠 Kiến trúc GraphRAG cho Hệ thống IELTS Assessment

Tài liệu này giải thích cách dữ liệu từ các file Markdown được chuyển hóa thành một "Đồ thị tri thức" (Knowledge Graph) trong Neo4j để phục vụ việc chấm điểm và phân tích bài viết.

## 1. Cấu trúc Đa tầng (Hybrid Architecture)

Hệ thống kết hợp hai công nghệ tìm kiếm tiên tiến nhất hiện nay:
*   **Vector Search:** Tìm kiếm các đoạn văn bản có ý nghĩa tương đồng (Dùng để lấy ngữ cảnh).
*   **Graph Reasoning:** Truy vết các mối quan hệ logic giữa các tiêu chí chấm điểm (Dùng để đưa ra quyết định chấm điểm).

---

## 2. Các thành phần chính trong Đồ thị (Schema)

### A. Các loại Nút (Node Labels)
| Nhãn (Label) | Ý nghĩa |
| :--- | :--- |
| **KnowledgeChunk** | Một đoạn văn bản gốc được cắt nhỏ từ file MD (Lưu trữ dưới dạng Vector Embedding). |
| **IELTS_Criteria** | 4 tiêu chí chấm điểm chính (TR, CC, LR, GRA). |
| **KnowledgePoint** | Các khái niệm kiến thức cụ thể (ví dụ: "Passive Voice", "Topic Vocabulary"). |
| **ErrorType** | Các loại lỗi hệ thống có thể nhận diện và gán nhãn. |
| **BandScore** | Các mốc điểm mục tiêu từ 1.0 đến 9.0. |

### B. Các loại Quan hệ (Relationships)
| Quan hệ | Ý nghĩa |
| :--- | :--- |
| **MENTIONS** | Kết nối một đoạn văn bản gốc tới một khái niệm cụ thể mà nó giải thích. |
| **PART_OF** | Xác định kiến thức này thuộc về tiêu chí chấm điểm nào. |
| **REQUIRED_FOR** | Điều kiện cần để đạt được một mốc Band Score nhất định. |
| **EXEMPLIFIES** | Một ví dụ cụ thể minh họa cho một quy tắc hoặc cách dùng từ. |
| **VIOLATES** | Đánh dấu sự vi phạm quy tắc (Dùng trong phân tích bài làm). |

---

## 3. Luồng nạp dữ liệu (Ingestion Pipeline)

Khi chạy script `ingest-md.js`, hệ thống thực hiện:

1.  **Chunking:** Chia nhỏ file Markdown thành các đoạn nhỏ để lưu vào `KnowledgeChunk`.
2.  **Embedding:** Chuyển các đoạn đó thành dãy số (Vector) để tìm kiếm Semantic Search.
3.  **Entity Extraction:** AI (Gemini) phân tích văn bản để tìm ra các Thực thể (Entities) và Quan hệ (Relationships) để xây dựng đồ thị.

---

## 4. Lợi ích của mô hình này

*   **Chấm điểm khách quan:** AI luôn bám sát các tiêu chí được định nghĩa trong file MD của bạn.
*   **Phản hồi chi tiết:** Hệ thống có thể chỉ rõ: "Bạn bị trừ điểm Lexical Resource vì lỗi X, lỗi này được định nghĩa tại file Y".
*   **Lộ trình học tập:** Dựa trên các nút kiến thức học sinh hay sai, hệ thống sẽ gợi ý các file MD tương ứng để học lại.
