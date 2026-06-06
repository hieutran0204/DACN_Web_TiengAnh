# KIẾN TRÚC ĐA MÔ HÌNH CHUYÊN BIỆT HÓA (SPECIALIZED MULTI-MODEL ARCHITECTURE)
## HỆ THỐNG CHẤM ĐIỂM ESSAY HYBRID GRAPHRAG — DỰ ÁN TESTKILLER

---

## 1. TỔNG QUAN KIẾN TRÚC (ARCHITECTURE OVERVIEW)

Hệ thống core AI của **TestKiller** được thiết kế theo mô hình **Hybrid Micro-Macro Architecture** kết hợp **GraphRAG** (Đồ thị tri thức & Truy xuất vector). Để tối ưu hóa đồng thời ba chỉ số: **Độ chính xác học thuật (Accuracy)**, **Tốc độ phản hồi (Latency)**, và **Chi phí vận hành (Cost/OpEx)**, hệ thống phân tách dòng chảy xử lý thành 5 tầng độc lập (Layered Pipeline). 

Thay vì sử dụng một mô hình ngôn ngữ lớn (LLM) duy nhất gánh vác toàn bộ quy trình, mỗi tầng dữ liệu được đảm nhiệm bởi một thực thể công nghệ (Thuật toán cứng, SLM hoặc LLM chuyên biệt) tối ưu nhất cho tác vụ đó.

---

## 2. PHÂN CHIA MÔ HÌNH CHI TIẾT THEO TỪNG TẦNG (LAYERED MODEL SPECIFICATION)

| Tầng Xử Lý (Layer) | Tên Thành Phần (Component) | Nhiệm Vụ Cốt Lõi | Mô Hình & Giải Pháp Tối Ưu | Biện Giải Kỹ Thuật (Technical Justification) |
| :--- | :--- | :--- | :--- | :--- |
| **Layer 1** | **Pre-processing Engine** | • Phân tách bài viết thành mảng các câu và các đoạn văn thô.<br>• Đếm từ (Word count), đếm câu (Sentence count) thực tế.<br>• Trích xuất các từ nối cấu trúc (Discourse Markers). | **Không dùng LLM**<br>• Script Python chuyên dụng (spaCy / NLTK)<br>• RegEx / Thư viện so khớp chuỗi cứng. | • Tối ưu hóa tuyệt đối về tốc độ (xử lý dưới vài phần nghìn giây).<br>• Tiết kiệm 100% chi phí tài nguyên, chạy nhẹ nhàng trên CPU.<br>• Đảm bảo tính nhất quán của dữ liệu thô đầu vào. |
| **Layer 2** | **Discourse Classifier** | • Duyệt qua từng câu đơn lẻ trong bài văn.<br>• Gán nhãn ngữ cảnh chức năng (Discourse Role) như: *Topic Sentence, Evidence, Example, Counterargument, Rebuttal, Conclusion...* | **Small Language Model (SLM)**<br>• `Llama 3.2 3B` (Ollama local)<br>• Hoặc model BERT/DeBERTa nhỏ chuyên gán nhãn chuỗi. | • Kích thước siêu nhẹ (~2-3GB VRAM), tốc độ phản hồi chớp nhoáng.<br>• Khả năng xử lý bất đồng bộ tốt, triệt tiêu lỗi quá tải lượt gọi đồng thời (**429 Too Many Concurrent Requests**).<br>• Đủ thông minh để nhận diện nhãn ngữ pháp câu khi có Prompt định hướng tốt. |
| **Layer 3** | **Coherence Scan Engine** | • Xây dựng đồ thị lập luận trên **Neo4j** từ kết quả Layer 2.<br>• Quét toán học (Cosine Similarity) để bắt lỗi nhảy cóc logic (`LOGIC_JUMP`).<br>• Xác định cấu trúc lập luận sai luật như lặp luận điểm liên tiếp (`REPETITIVE_CLAIM`). | **Không dùng LLM**<br>• Thuật toán đồ thị cứng.<br>• Câu lệnh truy vấn Cypher Query trên Neo4j Database. | • Tính toán logic mang tính tuyệt đối (**Deterministic Logic**).<br>• Tốc độ truy vấn RAM dưới 5ms.<br>• Tạo ra lớp rào chắn (Guardrail) độc lập, ngăn chặn hoàn toàn việc AI bị đánh lừa bởi văn phong trôi chảy cục bộ của thí sinh. |
| **Layer 4** | **Structural RAG** | • Nhúng chuỗi xương cá của học sinh đã được gắn tag (VD: `[CLAIM]... [EXAMPLE]...`).<br>• Truy vấn trên RAM Cache dữ liệu để tìm kiếm cấu trúc bài mẫu Band 8.5+ tương đồng nhất. | **Embedding Model**<br>• `nomic-embed-text` (Ollama local)<br>• Thuật toán Cosine Similarity chạy trực tiếp trên mảng In-Memory JSON Cache. | • Tránh nghẽn I/O ổ đĩa cứng thông qua cơ chế đệm dữ liệu trên RAM.<br>• Định dạng truy vấn dạng cấu trúc giúp mô hình nhúng tập trung so khớp dòng chảy tư duy logic của bài viết, thay vì bị nhiễu do từ vựng thô khác biệt chủ đề. |
| **Layer 5** | **Macro Evaluation (The Final Judge)** | • Tiêu thụ toàn bộ Siêu ngữ cảnh (**Rich Context**) dọn sẵn bao gồm: Feature Map cấu trúc, danh sách lỗi từ Neo4j, và bài mẫu Band 8+ từ Layer 4.<br>• Chấm điểm 4 tiêu chí IELTS và render lời khuyên Sư phạm (**Scaffolding Feedback**). | **Medium/Large Model**<br>• **Demo/Dev:** `Llama 3 8B` / `Qwen 2.5 14B` (Ollama Local)<br>• **Production:** `Gemini 1.5 Flash` (Cloud API giá rẻ) | • **Nguyên lý RAG:** Khi ngữ cảnh đầu vào được cung cấp cực kỳ chi tiết và tường minh, mô hình ngôn ngữ không cần quá lớn vẫn có thể hoàn thành xuất sắc nhiệm vụ tổng hợp.<br>• Con LLM cuối cùng này chỉ đóng vai trò làm **Bộ diễn họa sư phạm (Renderer)**, biến đống dữ liệu lỗi thô thành văn bản nhận xét mượt mà, sâu sắc. |

---

## 3. LỘ TRÌNH DỊCH CHUYỂN MÔ HÌNH CHIẾN LƯỢC (MODEL MIGRATION ROADMAP)

Để đảm bảo tiến độ phát triển, TestKiller áp dụng quy trình **Model Cascading** (Thác đổ mô hình) qua 3 giai đoạn:

```
[ Giai đoạn 1: BÀO GEMINI API ] ──> [ Giai đoạn 2: CHUYỂN OLLAMA LOCAL ] ──> [ Giai đoạn 3: TINH CẤT SLM (3B) ]
(Nghiên cứu & Cày dữ liệu)           (Độc lập công nghệ offline)              (Tối ưu hóa chi phí Production)
```

1. **Giai đoạn 1: Bào Gemini Cloud API (R&D & Data Ingestion)**
   * Dùng Gemini API để kiểm thử độ chặt chẽ của Prompt chính, đồng thời sinh ra khoảng 1000 tập mẫu kết quả chấm lý tưởng (Ground Truth) để lưu kho làm Dataset nền tảng.
2. **Giai đoạn 2: Chuyển về Ollama Local (Staging & Demo)**
   * Vác toàn bộ prompt đã chín muồi sang các dòng Open Source Model tầm trung như **Llama 3 8B** hoặc **Qwen 2.5 14B** chạy cục bộ dưới máy qua Ollama. Phục vụ hoàn hảo cho việc demo thực tế trước Hội đồng tốt nghiệp không tốn một đồng chi phí API internet.
3. **Giai đoạn 3: Xuống SLM Tinh cất (Production & Commercialization)**
   * Lấy bộ Dataset nền tảng thu được từ Giai đoạn 1 đem đi **Fine-tune** ngược lại cho các dòng mô hình nhỏ như **Llama 3.2 3B**. Mô hình 3B sau khi học sâu sẽ chấm điểm cực kỳ chính xác cho riêng bài thi IELTS với tốc độ chớp nhoáng và chi phí vận hành server đám mây gần như bằng không.

---

## 4. GIÁ TRỊ CỐT LÕI MANG LẠI CHO ĐỒ ÁN TỐT NGHIỆP

Việc hiện thực hóa và phân chia mô hình theo cấu trúc kiến trúc đa tầng này đem lại những lợi thế kỹ thuật mang tính thuyết phục tuyệt đối trước Hội đồng Học thuật:

* **Nguyên lý Độc lập Trách nhiệm (Separation of Concerns):** Phân chia công việc rõ ràng giúp hệ thống chạy ổn định. Tác vụ nặng gán nhãn câu đơn được cô lập ở model nhỏ (3B) giúp hệ thống không bao giờ bị nghẽn mạch hay dính lỗi từ chối dịch vụ.
* **Cơ chế Phủ quyết Tuyệt đối (Veto Power Guardrail):** Điểm số ảo tưởng, dễ dãi của AI (Leniency Bias) luôn bị kiểm soát chặt chẽ bởi bộ luật đếm từ của Constraint Engine và bộ quét mạch logic đồ thị tự động của Neo4j, ép điểm số trả về luôn sát với giám khảo thực tế.
* **Tư duy Kiến trúc sư Hệ thống (Solution Architect Mindset):** Chứng minh sản phẩm có khả năng thương mại hóa thực tế cao, kiểm soát chặt chẽ tài nguyên phần cứng, thoát ly hoàn toàn khỏi cái mác "AI Wrapper" thông thường.
