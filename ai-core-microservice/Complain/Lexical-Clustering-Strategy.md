# CHIẾN LƯỢC XỬ LÝ 100K TỪ VỰNG & TỪ ĐA NGHĨA (LEXICAL CLUSTERING & POLYSEMY)

Tài liệu này lưu trữ ý tưởng kiến trúc cấp cao (Architectural Strategy) để xử lý kho dữ liệu 100.000 từ vựng (`dictionary_data.jsonl`) nhằm phục vụ cho tiêu chí Lexical Resource của hệ thống TestKiller.

## 1. Vấn đề "Khoai sắn" (The Cold Start Problem)
Khoảng 100k từ vựng được cào về nhưng không có nhãn Level (A1-C2) hay Topic cụ thể. Việc gọi LLM để phân loại 100k từ là bất khả thi về mặt chi phí và thời gian.

## 2. Giải pháp: Vector-based Semantic Clustering (Gán nhãn bằng Vector)
Thay vì dùng LLM, chúng ta dùng cơ chế "Mỏ neo tọa độ" (Anchor Points):
1. **Khởi tạo mỏ neo**: Lấy 8k từ chuẩn IELTS (đã có sẵn Level và Topic) nhúng thành 8.000 Vector tọa độ.
2. **Nhúng từ chưa biết**: Lấy các từ `Unknown` nhúng thành Vector.
3. **Phân cụm (K-NN)**: Dùng **Cosine Similarity** để tìm xem từ `Unknown` đó nằm gần "mỏ neo" nào nhất. 
    * *Ví dụ*: Từ `authentication` nằm sát từ `security` (Topic: Technology). Ta tự động gán nhãn Topic: Technology cho nó.
4. **Cập nhật Neo4j**: Tạo ra mối quan hệ mới `[:SEMANTICALLY_SIMILAR]` trên đồ thị.

## 3. Thách thức: Từ Đa Nghĩa (Polysemy)
Nếu chỉ nhúng chữ thô (ví dụ: `bank`), Vector sẽ bị nội suy sai lệch giữa các nghĩa khác nhau (Bờ sông vs Ngân hàng).

## 4. Giải pháp triệt để: Definition Embedding (Nhúng Định Nghĩa)
Tận dụng cấu trúc Graph của Neo4j: `(Word) -[:HAS_MEANING]-> (Definition)`
* **KHÔNG** nhúng (embed) cái `Word`.
* **CHỈ** nhúng cái `Definition` (Định nghĩa).
    * *Định nghĩa 1*: "The land alongside a river" -> Vector sẽ trôi về cụm Topic: Nature.
    * *Định nghĩa 2*: "A financial establishment" -> Vector sẽ trôi về cụm Topic: Economy.
* **Quy trình hoạt động**: Khi hệ thống đọc câu của thí sinh (VD: "I deposit money in the bank"), Context Vector của câu đó sẽ khớp hoàn hảo với *Định nghĩa 2*, từ đó hệ thống biết chính xác thí sinh đang dùng từ "bank" với Topic Economy.

---
*Ghi chú: Chiến lược này giúp hệ thống tiết kiệm 99% chi phí API LLM cho việc gán nhãn, đồng thời biến hệ thống TestKiller thành một "từ điển sống" thông minh, có khả năng tự suy luận ngữ nghĩa tinh tế dựa trên ngữ cảnh.*
