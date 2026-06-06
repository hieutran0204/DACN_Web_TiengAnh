# Layer 5: Macro-Evaluation & Model Cascading Roadmap

Layer 5 là tầng "Thẩm định cuối cùng" (Final Judge), nơi hội tụ toàn bộ tri thức từ 4 tầng bên dưới để đưa ra con số Band Score chính xác và các lời khuyên sư phạm (Scaffolding Feedback).

## 🤖 1. Cơ chế Suy luận Tổng hợp (Hybrid Reasoning)

Layer 5 không hoạt động dựa trên cảm tính của AI, mà dựa trên sự đối chiếu đa nguồn:
1.  **Dữ liệu thực tế (Facts)**: Feature Map từ Layer 1.
2.  **Lỗi logic (Constraints)**: Danh sách LOGIC_JUMP từ Neo4j (Layer 3).
3.  **Trần điểm (Guardrails)**: Hard Caps từ Constraint Engine (Dựa trên Word Count/Sentence Count).
4.  **Tri thức chuẩn (Reference)**: Bộ xương bài mẫu Band 8+ từ Vector DB (Layer 4).

AI đóng vai trò như một điều phối viên, tổng hợp 4 nguồn tin này để viết thành một bản báo cáo JSON có cấu trúc, đảm bảo tính minh bạch và khách quan (Transparency).

## 🛣️ 2. Lộ trình Dịch chuyển Mô hình (Model Cascading Roadmap)

Để tối ưu hóa chi phí vận hành (OpEx) và khả năng triển khai diện rộng, hệ thống được thiết kế để dịch chuyển qua 3 giai đoạn:

### Giai đoạn 1: The Oracle (Cloud LLM - Gemini/GPT)
*   **Mục tiêu**: Nghiên cứu (R&D) và tạo nhãn chuẩn (Ground Truth).
*   **Vai trò**: Kiểm chứng độ chặt chẽ của Prompt và xây dựng bộ Dataset mẫu (~1000 samples).

### Giai đoạn 2: The Validation (OSS Large Model - Llama3 8B/20B)
*   **Mục tiêu**: Độc lập công nghệ (Sovereignty) và chạy 100% Local qua Ollama.
*   **Vai trò**: Kiểm chứng khả năng tuân thủ định dạng JSON và xử lý ngữ cảnh phức tạp mà không cần Internet.

### Giai đoạn 3: The Optimizer (Small Language Model - 3B Fine-tuned)
*   **Mục tiêu**: Tối ưu hiệu năng tối đa trên phần cứng dân dụng (RAM 8GB).
*   **Nguyên lý**: Tận dụng ngữ cảnh giàu (Rich Context) từ GraphRAG để sử dụng các mô hình siêu nhỏ (Llama 3.2 3B / Phi-3.5) nhưng đã được fine-tune chuyên biệt cho nhiệm vụ "Viết nhận xét IELTS".

## 🛡️ 3. Cơ chế Kiểm soát AI (Guardrail Logic)

Layer 5 áp dụng cơ chế **Veto Power** (Quyền phủ quyết):
*   Nếu AI đề xuất điểm 7.0 nhưng **Constraint Engine** báo cáo bài viết chỉ có 35 từ $\rightarrow$ Hệ thống tự động kích hoạt **Hard Cap** và bẻ điểm về 3.0.
*   Điều này triệt tiêu hoàn toàn hiện tượng AI ảo tưởng (Hallucination) và đảm bảo tính kỷ luật trong chấm điểm.

## 📈 4. Giá trị Đồ án & Thương mại hóa

Kiến trúc Model Cascading chứng minh rằng: **Hệ thống không phụ thuộc vào độ lớn của Model mà phụ thuộc vào chất lượng của Context**. Đây là hướng đi bền vững, giúp hệ thống có thể chạy mượt mà trên các hạ tầng Cloud giá rẻ hoặc thiết bị đầu cuối của người dùng.
