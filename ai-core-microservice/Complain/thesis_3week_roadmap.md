# 🎯 Kế Hoạch 3 Tuần "Về Đích" Đồ Án — Mục Tiêu Điểm 8.0+

> **Mục tiêu**: Tập trung toàn bộ vào **Defensible Thesis** (Bảo vệ tính học thuật trước hội đồng) và **Demonstrability** (Khả năng demo trơn tru). Bỏ qua các vấn đề production/scaling chưa cần thiết.
> **Thời hạn**: 3 tuần (Nộp báo cáo) + 1 tuần buffer (Bảo vệ)
> **Chiến lược**: Lấp các lỗ hổng sư phạm IELTS (GRA, TR) để hội đồng không bắt bẻ được, sau đó đẩy mạnh Personalization (Trend, Exercise) để ghi điểm cộng.

---

## 🗓️ Tuần 1 (26/5 - 1/6): Sửa Sai Học Thuật — Core Defense

Đây là những vấn đề nghiêm trọng nhất cần fix để hệ thống chấm điểm "đúng chuẩn Cambridge". Nếu không làm, hội đồng (đặc biệt là GV rành IELTS) sẽ phản biện rất gắt.

| Ngày | Task | Why it matters (Lý do bảo vệ) | Status |
|:---:|:---|:---|:---:|
| 1-2 | **Fix GRA Threshold**<br>Bỏ `complex_ratio < 15%` → Thay bằng cap dựa trên `fragment_rate` và lỗi SVA/Tense nghiêm trọng. | Hiện tại đang tính sai luật Cambridge. Bài toàn câu đơn mà không lỗi vẫn phải được 6.0 GRA. | ⏳ To-do |
| 2-3 | **Đổi Metric LR**<br>Thay TTR (Type-Token Ratio) bằng AWL (Academic Word List) Coverage. | TTR là metric NLP, không đo lường được vocabulary "complexity" như IELTS yêu cầu. | ⏳ To-do |
| 3-4 | **TR Topic Drift Detection**<br>Tính cosine similarity giữa đề bài (prompt) và đoạn văn. Nếu < 0.4 → Cap TR ≤ 5.5. | Task Response đang hoàn toàn bị bỏ trống, essay lạc đề vẫn có thể được điểm cao. | ⏳ To-do |
| 4-5 | **Wrap Python Bridge**<br>Thêm retry x3 + fallback quality flag khi sập. | Ngăn chặn cảnh demo bị crash màn hình đỏ trước mặt hội đồng. | ⏳ To-do |
| 5 | **Calibrate Cliché Threshold**<br>Test trên 10 bài IELTS thực tế để lấy con số density phù hợp. | Con số `density >= 4` hiện tại là áng chừng, cần data thực nghiệm. | ⏳ To-do |

---

## 🗓️ Tuần 2 (2/6 - 8/6): Evaluation + Personalization — "Wow Factor"

Tuần này tạo ra chất liệu để viết báo cáo và các tính năng biểu đồ đẹp mắt để demo.

| Ngày | Task | Why it matters (Lý do bảo vệ) | Status |
|:---:|:---|:---|:---:|
| 1-2 | **Learning Curve Graph Data**<br>Lưu `overall_band` vào Neo4j Essay nodes. | Sẽ có biểu đồ đường cho thấy học viên tăng điểm theo thời gian. Rất ăn tiền khi demo. | ⏳ To-do |
| 2-3 | **Improvement/Regression Tracking**<br>So sánh `MAKES_ERROR` count hiện tại với quá khứ. Thêm tag `trend: improving/worsening`. | Chuyển từ "đếm lỗi" sang "theo dõi tiến độ" — cốt lõi của tính năng Personalization. | ⏳ To-do |
| 3-4 | **Exercise Ontology**<br>Tạo node `Exercise` + Quan hệ `ErrorType -[:FIXED_BY]-> Exercise`. Add 20-30 mẫu cơ bản. | Biến AI từ "bác sĩ chẩn đoán" thành "giáo viên kê đơn" bài tập. | ⏳ To-do |
| 4-5 | **Mở rộng Evaluation Benchmark**<br>Lên 30 test cases, chạy script `run-eval.js` lấy kết quả cuối cùng. | Đưa số liệu Recall@K, MAE chính xác vào chương "Đánh giá kết quả" trong báo cáo. | ⏳ To-do |

---

## 🗓️ Tuần 3 (9/6 - 15/6): Viết Báo Cáo & Hoàn Thiện

Tập trung 100% vào documents.

- [ ] **Architecture Diagram**: Vẽ lại luồng 10 bước cực kỳ chi tiết, nhấn mạnh Hybrid Pipeline (Rule-based + Graph + LLM).
- [ ] **Chương Đánh Giá**: Trình bày rõ ràng các metrics (MAE, Recall@K). Làm bảng so sánh "Điểm yếu AI chấm essay thông thường" vs "Cách GraphRAG giải quyết".
- [ ] **Case Studies**: Lấy 5 bài (Band 5, 6, 6.5, 7, 8) → So sánh điểm AI chấm vs điểm Examiner thật (Ground truth).
- [ ] **Buffer**: Debug, re-test toàn bộ quy trình từ login đến trả feedback.

---

## 🗓️ Tuần 4 (16/6 - Bảo Vệ): Demo Prep

- [ ] **Chuẩn bị 3 Essays mẫu** (Tốt - Vừa - Kém) để demo sự phân biệt rạch ròi.
- [ ] **Test độ ổn định** (Chạy qua luồng chấm điểm 10 lần liên tục).
- [ ] **Anticipated Q&A**:
    - *Câu hỏi: Làm sao chắc AI chấm đúng Grammar?* → TL: Bọn em dùng hybrid rule-based chặn lại, không cho LLM tự bịa lỗi.
    - *Câu hỏi: Khác gì quăng bài cho ChatGPT?* → TL: ChatGPT có "bias nịnh hót", dễ dãi. Hệ thống này có Graph constraints (Cliché, Fragment) ép điểm xuống đất theo đúng Rubric.
    - *Câu hỏi: Dữ liệu đồ thị (Graph) giúp gì?* → TL: Bắt lỗi "Logic Jump" và "Unsupported Claim" mà NLP bình thường không quét được.

---

## 🚫 OUT OF SCOPE (Tuyệt đối không làm trong 3 tuần này)

1. **Migrate Vector DB** (Chuyển sang Qdrant/Weaviate) - Tốn thời gian setup infra, hội đồng không soi performance scale.
2. **Message Queue / WebSocket** - Cầu kỳ, mất thời gian, loading spinner là đủ để demo.
3. **Redis Caching** - Không có tác dụng cho demo 1 user.
4. **Misconception Pattern Tracking** - Quá khó để implement logic trong 3 tuần.
5. **Scale lên 100 test cases** - 30 là con số "vừa đủ đẹp" cho đồ án đại học.
