# AI Evaluation & Feedback Architecture

Tài liệu này tổng hợp toàn bộ quy trình, cấu trúc (Schema), các nhãn (Labels), và các node logic (Graph) trong hệ thống chấm điểm bài viết IELTS bằng AI.

## 1. Tổng quan luồng chấm điểm (Evaluation Pipeline)

Quá trình chấm bài trải qua 3 lớp chính:

1. **Micro-Evaluator (Phân tích cấp độ câu)**
   - Nhận diện các lỗi ngữ pháp cơ bản (Rule-based).
   - Sử dụng **Discourse Classifier** (thông qua Ollama) để phân loại vai trò của từng câu văn (Data Bootstrapping).
2. **Graph Engine & Feature Extraction (Phân tích cấu trúc đoạn văn)**
   - Khảo sát sự mạch lạc (Coherence & Cohesion).
   - Kiểm tra các lỗi logic nặng (Sudden Logic Jumps, Unsupported Claims) để áp dụng **Hard Caps** (giới hạn điểm tối đa).
3. **Macro-Evaluator (Đánh giá tổng thể bằng LLM mạnh - Gemini)**
   - Tổng hợp lỗi câu, cấu trúc đoạn và yêu cầu đề bài.
   - Trả về điểm thành phần, điểm tổng, và nhận xét, gợi ý sửa đổi (Scaffolding Feedback).

---

## 2. Danh sách các Nhãn Vai Trò Câu (Discourse Roles / Nodes)

Được định nghĩa tại `discourse-classifier.service.js`, hệ thống sẽ phân loại các câu văn vào các "Node" sau để dựng thành **Knowledge Graph** đánh giá tư duy logic của học viên:

*   **`topic_sentence`**: Câu chủ đề (Thường nằm ở đầu đoạn hoặc chứa ý chính).
*   **`supporting_detail`**: Câu diễn giải, bổ sung ý nghĩa (Luận cứ / Evidence).
*   **`example`**: Câu ví dụ (Chứng minh cho luận cứ).
*   **`transitional`**: Câu chuyển ý (Tuy nhiên, Mặc dù, Hơn thế nữa...).
*   **`conclusion`**: Câu chốt đoạn, kết luận.

*Quy tắc logic (Graph Rule):* Một bài viết chặt chẽ phải có liên kết `:SUPPORTS` (Vd: `example` -> `supporting_detail` -> `topic_sentence`). Nếu thiếu liên kết (Ví dụ: Đưa ra Claim nhưng không có Evidence) sẽ bị cắm cờ `Unsupported Claim`.

---

## 3. Cấu trúc JSON Dữ liệu Phản hồi (Feedback Schema)

Toàn bộ kết quả chấm điểm được lưu vào Database ở phía Backend (Collection `WritingSubmission`). Dưới đây là cấu trúc chi tiết mà LLM trả về cho mỗi bài chấm (Trích xuất từ `prompt.service.js` và `Submission.model.js`):

```json
{
  "overall_band": 7.0,
  "band_breakdown": {
    "task_response": 7,             // Điểm giải quyết yêu cầu đề
    "coherence_cohesion": 7,        // Điểm mạch lạc, liên kết
    "lexical_resource": 7,          // Điểm từ vựng
    "grammatical_range_accuracy": 7 // Điểm ngữ pháp
  },
  
  "feedback_vn": "Nhận xét tổng quát về bài làm...",
  
  "evidence_based_justification_vn": {
    "task_response": "Lý giải điểm TR dựa trên luận điểm và logic...",
    "coherence_cohesion": "Phân tích luồng logic (Diễn dịch/Quy nạp) và sự mạch lạc dựa trên Graph Engine...",
    "lexical_resource": "Đánh giá vốn từ và sự chính xác...",
    "grammatical_range_accuracy": "Đánh giá độ đa dạng cấu trúc và các lỗi nghiêm trọng..."
  },
  
  "advanced_vocabulary": [
    {
      "word": "mitigate",
      "level": "C1",
      "context": "mitigate these challenges",
      "meaning_vn": "giảm nhẹ",
      "reason": "Sử dụng chính xác động từ học thuật thay cho 'reduce'..."
    }
  ],
  
  "strengths": [
    "Sử dụng tốt câu phức",
    "Có câu chủ đề rõ ràng"
  ],
  
  "weaknesses": [
    "Lỗi chia động từ số ít số nhiều",
    "Thiếu ví dụ chứng minh ở đoạn 2"
  ],
  
  "recommendations_vn": "Chiến lược tăng band: Em nên tập trung vào việc...",
  
  "scaffolding_suggestions": [
    {
      "original": "Câu gốc có vấn đề",
      "improved": "Cách sửa gợi ý để nâng band điểm",
      "logic": "Giải thích tư duy đằng sau cách sửa này (Tại sao lại dùng từ nối này, tại sao lại dùng cấu trúc này)"
    }
  ],
  
  "grammar_errors_found": [
    "Lỗi mạo từ ở câu 3",
    "Lỗi thì hiện tại đơn ở câu 5"
  ]
}
```

---

## 4. Cơ chế Hard Caps (Chặn Điểm) & Xử Phạt Logic

Hệ thống có một cơ chế tự động đánh tụt điểm (Penalize) nếu phát hiện các lỗi nghiêm trọng, vượt quyền của LLM:

*   **Coherence Scan Results**: Nếu Graph Engine phát hiện các lỗi như *Sudden Logic Jumps* (Nhảy logic đột ngột) hoặc *Lack of logical progression* (Thiếu sự phát triển logic), hệ thống ép buộc điểm `Coherence & Cohesion (CC)` **không được vượt quá 5.0** theo đúng tiêu chuẩn chấm điểm của IELTS.
*   **Veto Power**: Lớp AI (Gemini) được cấp quyền "phủ quyết" (Veto) các lỗi ngữ pháp do máy chấm (Rule-based) đưa ra. Nếu câu đó phức tạp mà máy tính tưởng sai nhưng thực chất là cấu trúc câu nâng cao đúng, Gemini sẽ bỏ qua lỗi đó để không trừ oan điểm của học sinh.
