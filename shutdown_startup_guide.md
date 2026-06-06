# Hướng Dẫn Quy Trình Tắt & Mở Hệ Thống Đúng Cách (Tránh Lỗi Docker & Cổng Kết Nối)

Tài liệu này hướng dẫn bạn quy trình tắt (Shutdown) và khởi động (Startup) toàn bộ hệ thống (Frontend, Backend, AI Core Microservice, và Neo4j Docker) một cách an toàn và chuẩn xác trên hệ điều hành Windows, giúp tránh 100% các lỗi dính lock file database hoặc xung đột cổng (port conflict) khi chạy lại vào lần sau.

---

## 🛑 PHẦN 1: QUY TRÌNH TẮT HỆ THỐNG AN TOÀN (SHUTDOWN)

Khi bạn muốn nghỉ hoặc tắt máy tính, hãy thực hiện lần lượt các bước sau:

### Bước 1: Dừng các Service chạy bằng Node.js (Frontend, Backend, AI Microservice)
*   **Hành động**: Tìm đến các cửa sổ Terminal đang chạy lệnh `npm run dev` hoặc `npm run start`.
*   **Phím tắt**: Nhấn tổ hợp phím **`Ctrl + C`** (ở từng Terminal).
*   **Mục tiêu**: Việc này giúp Node.js đóng các kết nối socket, giải phóng RAM và trả lại các cổng mạng (`3000`, `5000`, `5173`) cho Windows một cách êm ái.

### Bước 2: Tắt Docker Container một cách sạch sẽ (Mấu chốt tránh lỗi Neo4j)
Tuyệt đối không tắt ngang Docker Desktop hoặc tắt nguồn máy tính khi container đang chạy, vì Neo4j có thể đang ghi dữ liệu xuống đĩa cứng và sẽ để lại file khóa dữ liệu (`database.lock`), khiến lần sau khởi động bị lỗi crash.
*   **Hành động**: Mở một Terminal tại thư mục gốc `Web_TiengAnh` (nơi có file `docker-compose.yml`) và chạy lệnh:
    ```bash
    docker compose down
    ```
*   **Ý nghĩa**: Lệnh này sẽ dừng các container một cách an toàn, lưu toàn bộ dữ liệu đang lưu trong bộ nhớ tạm xuống thư mục `./infra/neo4j/data` của bạn, giải phóng hoàn toàn các cổng `7474`, `7687` và xóa các tiến trình ảo của Docker.
*   **Mẹo**: Nếu bạn chỉ muốn dừng tạm thời mà không xóa container ảo, bạn có thể dùng lệnh `docker compose stop`. Tuy nhiên, `docker compose down` vẫn là sạch sẽ nhất và không làm mất dữ liệu của bạn (vì dữ liệu đã được map ra ngoài máy thật).

### Bước 3: Tắt Docker Desktop & Tắt Máy Tính
*   Khi Terminal thông báo `docker compose down` hoàn tất (thường mất 5-10 giây), bạn có thể tắt ứng dụng Docker Desktop (chuột phải ở thanh taskbar chọn Quit) và tắt máy tính bình thường.

---

## 🚀 PHẦN 2: QUY TRÌNH MỞ LẠI HỆ THỐNG (STARTUP)

Khi bạn bật máy lên để tiếp tục làm việc (ví dụ tối nay):

### Bước 1: Khởi động Docker Desktop
*   Hãy chắc chắn rằng ứng dụng Docker Desktop trên máy bạn đã được mở và ở trạng thái **Engine Running** (màu xanh lá cây).

### Bước 2: Khởi động Database (Neo4j Docker) trước tiên
Trước khi chạy code Backend hay AI, cơ sở dữ liệu phải hoạt động trước để tránh lỗi kết nối (`Connection Refused`).
*   Mở Terminal tại thư mục `Web_TiengAnh` và chạy:
    ```bash
    docker compose up -d
    ```
*   **Kiểm tra**: Chờ khoảng 15-20 giây để Neo4j khởi động hoàn tất. Bạn có thể truy cập vào trình duyệt web địa chỉ [http://localhost:7474](http://localhost:7474) để kiểm tra xem giao diện quản lý Neo4j đã hiện lên chưa.

### Bước 3: Khởi động các Node.js Service
Sau khi database đã sẵn sàng, bạn mở các Terminal tương ứng và chạy lệnh chạy code:
1.  **AI Core Microservice** (`ai-core-microservice`): `npm run dev`
2.  **Backend** (`backend`): `npm run start`
3.  **Frontend** (`frontend`): `npm run dev`

---

## 🛠️ XỬ LÝ SỰ CỐ NHANH (Nếu lỡ tắt sai quy trình và bị lỗi)

Nếu một ngày bạn bị mất điện đột ngột hoặc tắt máy ngang khiến Docker/Neo4j báo lỗi không chạy được ở lần tiếp theo:

1.  **Lỗi xung đột cổng (Port already allocated)**:
    *   *Cách sửa*: Chạy lệnh `docker compose down` để giải phóng sạch sẽ cổng ảo, sau đó chạy lại `docker compose up -d`.
2.  **Lỗi Neo4j dính Lock File (Database locks)**:
    *   *Dấu hiệu*: Container Neo4j bật lên rồi tự tắt liên tục (CrashLoop).
    *   *Cách sửa*: Vào thư mục `./infra/neo4j/data/dbms/` trên máy thật của bạn, tìm xem có file nào tên là `store_lock` hoặc `database.lock` hay không, xóa file đó đi rồi chạy lại `docker compose up -d`.
