# IELTS Writing Band Descriptors: GraphRAG Knowledge Base

## 1. Overview
Hệ thống này chứa toàn bộ các quy tắc tri thức (Master Knowledge) dùng để chấm điểm và phân tích bài viết IELTS Writing Task 2 dựa trên kiến trúc **GraphRAG**. Dữ liệu được chia thành 4 trụ cột chính theo tiêu chuẩn của Hội đồng Anh và IDP.

---

## 2. Các Trụ Cột Tri Thức

### 🟦 Coherence & Cohesion (CC) - Sự Mạch Lạc và Liên Kết
*Tập trung vào dòng chảy logic và các công cụ liên kết văn bản.*
- `coherence.md`: Logic nội tại và phương pháp phát triển ý PEEL.
- `cohesion.md`: Các cơ chế liên kết ngôn ngữ (Tham chiếu, Thay thế, Lược bỏ).
- `linking_words.md`: Phân loại và logic sử dụng từ nối (Band 5.0 vs Band 7.0+).
- `referencing_substitution.md`: Kỹ thuật tránh lặp từ bằng đại từ và danh từ tổng quát.
- `paragraphing.md`: Quy tắc chia đoạn văn và sự thống nhất ý tưởng.

### 🟩 Grammatical Range & Accuracy (GRA) - Ngữ Pháp
*Tập trung vào độ rộng của cấu trúc và độ chính xác của câu.*
- `sentence_variety.md`: Phân loại câu (Đơn, Ghép, Phức) và tỷ lệ vàng cho Band cao.
- `complex_structures.md`: Các "vũ khí" nâng band: Đảo ngữ, Câu điều kiện, Bị động.
- `common_errors_catalog.md`: Danh mục lỗi sai kinh điển (S-V Agreement, Articles, Uncountable Nouns).
- `punctuation.md`: Quy tắc dấu câu và các lỗi "hủy diệt" điểm số (Comma Splice).
- `accuracy_scoring_logic.md`: Công thức tính EFSR (Tỷ lệ câu không lỗi) để ra điểm số.

### 🟨 Lexical Resource (LR) - Từ Vựng
*Tập trung vào độ rộng, độ chính xác và sự tinh tế trong dùng từ.*
- `vocabulary_range.md`: Phân tầng từ vựng (Tier 1, 2, 3) và chỉ số AVR.
- `collocations_idioms.md`: Các cụm từ tự nhiên và thành ngữ học thuật.
- `word_precision_connotation.md`: Sắc thái nghĩa và văn phong học thuật (Register).
- `spelling_word_formation.md`: Chính tả và cấu tạo từ (Họ từ - Word Families).
- `lexical_scoring_logic.md`: Chỉ số LSI và logic phân biệt "Thử nghiệm" vs "Thành công".

### 🟥 Task Response (TR) - Đáp Ứng Yêu Cầu Đề Bài
*Tập trung vào tư duy nghị luận, sự nhất quán và độ sâu của nội dung.*
- `prompt_analysis_logic.md`: Cách giải mã đề bài và xác định yêu cầu bắt buộc.
- `position_consistency.md`: Theo dõi sự nhất quán của quan điểm từ đầu đến cuối bài.
- `idea_development_depth.md`: Đo lường chiều sâu của lập luận (Branching Depth).
- `relevance_logic.md`: Kiểm tra độ lạc đề bằng khoảng cách ngữ nghĩa (Semantic Distance).
- `task_response_scoring_logic.md`: Công thức tính điểm tổng hợp TR và các luật "Hard Cap".

---

## 3. Hướng dẫn Ingestion (Nạp dữ liệu)
Toàn bộ các file trên đều chứa phần **RAG Metadata** và **Graph Logic**. Khi nạp vào Neo4j:
1. Mỗi file `.md` sẽ được coi là một **Category**.
2. Các ví dụ **❌ Incorrect** và **✅ Corrected** sẽ được trích xuất thành các **Few-shot Nodes**.
3. Các nhãn lỗi như `[SVA_ERROR]` sẽ được dùng để gắn thẻ cho các bài viết của học viên.

---

## 4. Ghi chú cho Dev (Hiếu)
- **Mở rộng:** Khi tìm thấy cấu trúc hay hoặc lỗi mới, hãy cập nhật vào `common_errors_catalog.md` hoặc `complex_structures.md`.
- **Cập nhật:** Hệ thống GraphRAG sẽ ưu tiên các thông tin có trong thư mục này hơn là kiến thức thô của LLM để đảm bảo tính "IELTS chuẩn".
