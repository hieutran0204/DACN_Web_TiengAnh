# 🚀 Hybrid GraphRAG Writing Pipeline Architecture

Đây là tài liệu chi tiết về kiến trúc hệ thống chấm điểm IELTS Writing tự chủ (Sovereign AI) sử dụng 100% Local LLM kết hợp với Đồ thị mạch lập luận (Semantic Discourse Graph).

## 🏗️ Tổng quan kiến trúc (High-Level Architecture)

Hệ thống hoạt động theo mô hình **Hybrid Micro-Macro**:
1.  **Micro Layer**: Dùng AI nhỏ (Llama 3 / Qwen) để soi lỗi chi tiết từng câu và gắn nhãn chức năng.
2.  **Structural Layer (Graph)**: Xây dựng đồ thị liên kết giữa các câu để kiểm tra logic.
3.  **Macro Layer**: Dùng AI tổng hợp kết quả, đối chiếu với Knowledge Base (Vector DB) và Student Memory (Graph DB) để đưa ra điểm số cuối cùng.

---

## 🌊 Luồng xử lý chi tiết (Pipeline Flow)

### 🧱 Bước 1: Tiền xử lý (Preprocessing)
*   Sử dụng thư viện NLP `compromise` để tách bài viết thành danh sách các câu và đoạn văn.
*   Lợi ích: Đảm bảo AI không bị "ngợp" khi phải đọc cả bài văn dài.

### 🔍 Bước 2: Phân tích vi mô (Micro-Analysis)
*   **AI Model**: Qwen2.5-1.5B hoặc Llama-3.2-3B (Local/Cloud Ollama).
*   **Nhiệm vụ 1**: Phát hiện lỗi ngữ pháp, chính tả, dấu câu.
*   **Nhiệm vụ 2 (Mới)**: **Discourse Tagging** - Gắn nhãn vai trò của câu (Topic Sentence, Example, Supporting Detail, Conclusion).
*   **Optimization**: Sử dụng *Concurrent Mode* (Xử lý 5 câu cùng lúc) để tăng tốc độ gấp 5 lần.

### ⛓️ Bước 3: Đồ thị mạch lập luận & Quét lỗi Vector (Semantic Graph)
*   **Công nghệ**: Neo4j Graph Database + Vector Similarity.
*   **Xây dựng**: Tạo các node `Sentence` chứa **Embedding (Vector)** và nối chúng bằng quan hệ `[:NEXT_SENTENCE]`.
*   **Kiểm tra logic toán học (Coherence Scan)**: 
    *   Sử dụng hàm `vector.similarity.cosine` để tính độ tương đồng ngữ nghĩa giữa 2 câu đứng cạnh nhau.
    *   **Logic phạt**: Nếu độ tương đồng thấp hơn 0.45 (nghĩa là 2 câu không liên quan gì đến nhau) VÀ câu tiếp theo không có từ nối (Discourse Marker) -> Hệ thống tự động gán lỗi `LOGIC_JUMP`.
    *   Đây là cách bắt lỗi "nhảy cóc ý tưởng" mà không một AI nào khác trên thị trường hiện nay làm chuẩn bằng cách này.

### 📊 Bước 4: Tổng hợp đặc trưng (Feature Building)
*   Gom tất cả lỗi từ bước 2 và các vấn đề logic từ bước 3 thành một **Feature Map** (Bản đồ đặc trưng).
*   Tính toán các chỉ số: Mật độ lỗi, độ phong phú từ vựng (TTR), tỷ lệ câu phức.

### 🤖 Bước 5: Chấm điểm tổng thể (Macro-Evaluation)
*   **Prompt Injection**: Đưa Feature Map, các đoạn văn mẫu từ Vector DB, và lịch sử học tập của sinh viên từ Graph DB vào Prompt.
*   **AI Model**: Qwen2.5-7B hoặc Llama-3-8B.
*   **Kết quả**: AI đóng vai trò là "Trọng tài", tổng hợp các bằng chứng thực tế từ Graph và Rule-based để đưa ra Band Score và nhận xét cuối cùng.

---

## 🧪 Cách kiểm tra (How to Test)

Để kiểm tra xem hệ thống đã hoạt động đúng theo hướng "Mạch lập luận" chưa, bạn hãy thử viết một đoạn văn cố tình sai logic:

**Bài test mẫu:**
> "For example, children spend too much time on smartphones. This leads to health problems. Therefore, technology is bad."

**Kết quả kỳ vọng:**
1.  **AI nhỏ**: Gắn nhãn câu 1 là `Example`, câu 3 là `Conclusion`.
2.  **Neo4j**: Nhận diện được là `Example` xuất hiện ngay đầu đoạn văn mà không có `Topic_Sentence`.
3.  **Hệ thống**: Trả về lỗi `COHERENCE_GAP` và `LOGIC_ORDER`.
4.  **AI tổng**: Nhận xét: "Bài viết của bạn bị trừ điểm Coherence vì đưa ví dụ ngay đầu đoạn văn mà không có câu dẫn dắt chủ đề."

---

## 🏗️ Tầng 2: Discourse Classification & Fallback (Mạch bảo hiểm)

Tầng này chịu trách nhiệm gán nhãn vai trò của câu với cơ chế dự phòng 3 lớp để đảm bảo hệ thống không bao giờ sập:

1.  **Lớp 1 (Ollama - Thầy giáo)**: Sử dụng AI mạnh để gán nhãn. Nếu thành công, dữ liệu sẽ được lưu vào `data/training_dataset.jsonl` để làm bộ dữ liệu huấn luyện (Bootstrapping).
2.  **Lớp 2 (Local Model - Học trò)**: (Đang phát triển) Sử dụng BERT-mini/T5 để xử lý nhanh nếu Ollama bận hoặc sập.
3.  **Lớp 3 (Rule-based - Phao cứu sinh)**: Sử dụng Regex và vị trí câu để "đoán" nhãn nếu cả 2 lớp AI trên đều không phản hồi.

---

## 📈 Ưu điểm của mô hình này
*   **Không tốn phí API**: 100% chạy trên server riêng.
*   **Chống ảo tưởng (Anti-Hallucination)**: AI không tự "đoán" lỗi, nó chỉ tổng hợp các lỗi mà Graph và Rule-based đã tìm ra.
*   **Tính khoa học**: Giải thích được tường tận "Tại sao tôi bị điểm thấp" bằng sơ đồ đồ thị.
*   **Tính tiến hóa**: Hệ thống càng dùng nhiều càng thông minh nhờ cơ chế tự thu thập dữ liệu để train model nhỏ.
