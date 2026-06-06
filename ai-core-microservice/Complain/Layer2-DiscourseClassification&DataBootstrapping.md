# Layer 2: Discourse Classification & Data Bootstrapping

Tầng này đóng vai trò là "Bộ não điều phối" (Orchestrator) trong việc xác định vai trò của từng câu văn trong mạch lập luận (Discourse Analysis) và thực hiện chiến lược tích lũy tri thức tự động (Data Bootstrapping).

## 🏗️ 1. Kiến trúc Phòng thủ 3 Lớp (Layered Fallback Strategy)

Để đảm bảo hệ thống không bao giờ bị "crash" và luôn đưa ra được nhãn phân loại, Layer 2 áp dụng chiến lược dự phòng ưu tiên từ cao xuống thấp:

1.  **Ưu tiên 1: The Teacher (Ollama LLM - gpt-oss:20b-cloud)**
    *   Sử dụng mô hình ngôn ngữ lớn để gán nhãn dựa trên ngữ cảnh sâu.
    *   Nhãn được gán: `topic_sentence`, `supporting_detail`, `example`, `conclusion`, v.v.
2.  **Ưu tiên 2: Local Small Model (Reserved Layer)**
    *   Tầng chờ sẵn để tích hợp các mô hình BERT/T5 đã được fine-tune riêng cho Discourse.
3.  **Ưu tiên 3: Rule-based Heuristics (The Guardian)**
    *   Sử dụng các luật cứng dựa trên từ nối (Discourse Markers) và vị trí của câu trong đoạn văn để gán nhãn khi AI gặp sự cố.

## 🛡️ 2. Cơ chế Chuẩn hóa Nhãn (Data Normalization)

Mọi nhãn từ Ollama (vốn không ổn định) đều đi qua bộ lọc chuẩn hóa trước khi đẩy xuống Đồ thị:
*   **Hàm xử lý**: `.trim().toLowerCase().replace(/\s+/g, '_')`
*   **Mục tiêu**: Đảm bảo mọi nhãn đều ở định dạng `snake_case` viết thường để Layer 3 (Neo4j) có thể thực hiện truy vấn chính xác 100%.

## 🚀 3. Chiến lược Data Bootstrapping (Tự tiến hóa)

Hệ thống không chỉ chấm điểm mà còn tự xây dựng Dataset huấn luyện:
*   **File lưu trữ**: `data/training_dataset.jsonl`
*   **Cơ chế**: Mỗi khi Ollama (The Teacher) gán nhãn thành công với độ tự tin cao, hệ thống sẽ tự động append cặp `(Sentence, Discourse_Label)` vào dataset.
*   **Giá trị**: Sau ~1000 mẫu, chúng ta có thể dùng dataset này để huấn luyện mô hình nhỏ (Ưu tiên 2), giúp giảm phụ thuộc vào LLM và tăng tốc độ xử lý lên gấp 10 lần.

## 📊 4. Các nhãn Discourse chuẩn hóa (Ontology)

| Nhãn (Slug) | Ý nghĩa | Chức năng trong Đồ thị |
| :--- | :--- | :--- |
| `topic_sentence` | Câu chủ đề / Luận điểm | Chuyển thành Node `(:Claim)` |
| `supporting_detail` | Lý lẽ / Giải thích | Chuyển thành Node `(:Evidence)` |
| `example` | Ví dụ minh họa | Chuyển thành Node `(:Example)` |
| `conclusion` | Câu kết luận đoạn/bài | Chuyển thành Node `(:Sentence)` |
| `transitional` | Câu chuyển ý | Chuyển thành Node `(:Sentence)` |

## 🔗 5. Kết nối Hệ thống (Integration)

Dữ liệu từ Layer 2 sau khi được chuẩn hóa sẽ được đóng gói vào `enrichedSentencesForGraph` để nạp vào Neo4j, tạo tiền đề cho việc xây dựng Đồ thị Lập luận (Layer 3).
