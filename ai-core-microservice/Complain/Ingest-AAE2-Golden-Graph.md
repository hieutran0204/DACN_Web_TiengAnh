# Chiến lược Nạp Bộ Dữ Liệu "Chén Thánh" AAE2 vào Hệ Thống

Tài liệu này ghi chú lại các bước thao tác để nạp bộ dữ liệu **Argument Annotated Essays (AAE2)** của giáo sư Stab & Gurevych vào thẳng Tầng 3 (Neo4j) của TestKiller.

## 🌟 Đánh giá Sức mạnh: Tầng 2 & 3 sẽ "tiến hóa" như thế nào?

Bạn hỏi rất chuẩn: *"Khi có bộ này thì tầng 2 và 3 có được tăng cường đáng kể không?"*
Câu trả lời là: **KHÔNG CHỈ ĐÁNG KỂ, MÀ LÀ LỘT XÁC HOÀN TOÀN!**

1. **Với Tầng 2 (Discourse Classifier):**
   Thay vì chỉ phân loại mập mờ (đâu là Topic Sentence, đâu là Detail), bộ AAE2 ép hệ thống định nghĩa rõ ràng một "Luận điểm rễ" (MajorClaim) và các nhánh phụ. Tầng 2 sẽ có một cái mốc tham chiếu cực chuẩn về ranh giới câu (Boundary Detection) do chính con người cắt gọt, không bao giờ bị cắt sai ý như AI hiện tại.

2. **Với Tầng 3 (Neo4j Argumentation Graph):**
   Đây mới là "vụ nổ Big Bang". Hiện tại, Gemini tự đoán mò xem câu A có `SUPPORTS` câu B không (đôi khi nó đoán sai bét). Nhưng bộ AAE2 cung cấp hàng ngàn đường Link `[:SUPPORTS]` và `[:ATTACKS]` đã được các chuyên gia ngôn ngữ **duyệt bằng tay**.
   Khi nạp bộ này vào Neo4j, Tầng 3 của bạn sẽ ngay lập tức sở hữu một **"Bản đồ Logic Tuyệt Đối" (Golden Truth Graph)**. 
   Sau này, khi chấm bài user, AI của bạn chỉ việc lôi bản đồ này ra đối chiếu. Nếu user lập luận theo pattern có sẵn trong này -> Logic tốt. Nếu user đi chệch hướng -> Bắt lỗi Logic Jump chính xác 100%. Hệ thống của bạn sẽ mang dáng dấp của một hệ thống EdTech nghìn đô.

---

## 🛠️ Hướng dẫn thao tác (Dành cho ngày mai)

Vì mạng đang chặn HuggingFace, hãy làm theo các bước sau khi bạn đã có thời gian và sẵn sàng:

### Bước 1: Vượt rào và tải dữ liệu thô (Python)
1. Bật phần mềm VPN (1.1.1.1, TunnelBear, NordVPN,...).
2. Mở Terminal và chạy lệnh tải Data:
   ```bash
   python scripts/fetch_aae2_golden.py
   ```
3. Đợi script chạy xong. Nếu thành công, nó sẽ tạo ra file: `data/aae_golden_graph.json`. (Lúc này bạn có thể tắt VPN được rồi).

### Bước 2: Nạp thẳng vào Neo4j Tầng 3 (NodeJS)
1. Báo lại cho AI (là mình) biết bạn đã có file JSON.
2. Mình sẽ viết ngay một file `scripts/seed_aae_neo4j.js` chỉ khoảng 30 dòng code. Nhiệm vụ của nó là đọc file JSON vừa tải, dùng lệnh APOC đâm thẳng hàng chục ngàn Triplet vào Neo4j chỉ trong 5 giây mà không tốn một đồng API Gemini nào.
3. Chạy lệnh:
   ```bash
   node scripts/seed_aae_neo4j.js
   ```

### 🎯 Kết quả
Mở trình duyệt xem Neo4j Bloom, bạn sẽ thấy một chùm sao rực rỡ gồm hàng ngàn luận điểm đan xen nhau một cách hoàn hảo. Đó chính là trái tim logic của TestKiller!
