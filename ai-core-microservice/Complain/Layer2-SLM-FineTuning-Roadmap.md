# Lộ trình Fine-tune SLM 3B với Dataset AAE (Stab & Gurevych)

Tài liệu này vạch ra chiến lược nâng cấp Hệ thống AI của TestKiller từ việc phụ thuộc vào LLM thương mại (Gemini/GPT) sang sở hữu một **Lõi AI độc quyền (Proprietary AI Core)** chuyên biệt cho Argumentation Mining.

## 🎯 Mục tiêu
- **Thay thế Gemini ở Tầng 2 & 3** bằng một SLM (Qwen-2.5-3B hoặc Llama-3-8B).
- **Khắc phục triệt để lỗi "Ảo giác" (Hallucination)** và tối ưu hóa việc phân chia ranh giới câu (Boundary Detection).
- **Tạo ra Triplets có tính xác định cao (Deterministic)** để nạp thẳng vào Neo4j (Tầng 3).

## 🗺️ Lộ trình triển khai (4 Giai đoạn)

### Giai đoạn 1: Bootstrapping & Validate Architecture (Hiện tại)
- Tiếp tục sử dụng Gemini API để nạp dữ liệu mồi (Bootstrapping) vào Neo4j và Vector DB.
- Kiểm thử luồng truy vấn (GraphRAG) xem các Triplets sinh ra có đáp ứng đúng yêu cầu của bộ tiêu chí chấm điểm không.

### Giai đoạn 2: Chuẩn bị Dữ liệu Huấn luyện (Data Preparation)
- **Nguồn:** Dataset `pie/aae2` trên HuggingFace (Chứa các bài luận đã được chuyên gia gán nhãn `MajorClaim`, `Claim`, `Premise` và các quan hệ `supports`, `attacks`).
- **Xử lý:** Viết script Python tải bộ dữ liệu, chuyển đổi (Map) các nhãn gốc sang Ontology của TestKiller:
  - `MajorClaim` ➔ `[CLAIM]` (Major)
  - `Claim` ➔ `[CLAIM]`
  - `Premise` ➔ `[EVIDENCE]` / `[EXAMPLE]`
  - `supports` ➔ `[:SUPPORTS]`
  - `attacks` ➔ `[:REBUTTAL]`
- **Format Output:** JSONL (Định dạng tiêu chuẩn cho Fine-tuning như Alpaca hoặc ChatML).
  ```json
  {"instruction": "Extract argumentation triplets from this essay.", "input": "...", "output": "..."}
  ```

### Giai đoạn 3: Huấn luyện Mô hình (Fine-tuning SLM)
- **Công cụ:** Sử dụng [Unsloth](https://github.com/unslothai/unsloth) trên Google Colab (T4 GPU miễn phí hoặc A100). Unsloth giúp fine-tune Llama-3 / Qwen-2 nhanh gấp 2 lần và tốn ít VRAM hơn.
- **Kỹ thuật:** LoRA / QLoRA (Chỉ train một số trọng số phụ, giữ nguyên kiến thức tiếng Anh gốc của mô hình).
- **Mô hình đề xuất:** `Qwen/Qwen2.5-3B-Instruct` (Rất nhẹ, chạy cực nhanh) hoặc `meta-llama/Meta-Llama-3-8B-Instruct`.

### Giai đoạn 4: Deployment & Integration (Sản xuất)
- Xuất mô hình đã Fine-tune sang định dạng `GGUF`.
- Nạp model GGUF vào **Ollama** chạy local.
- Sửa lại file `services/graph.service.js`: Chuyển provider từ `gemini` sang `ollama`.
- **Kết quả:** Hệ thống chạy offline 100%, bảo mật dữ liệu, tốc độ infer siêu nhanh và bóc tách Triplet lập luận chuẩn xác như giáo sư ngôn ngữ học!
