import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import $ from "jquery";
import "datatables.net";
import { useAdminCheck, logout } from "../../utils/auth";

const backendUrl = "http://localhost:3000";

export default function SpeakingList() {
  const tableRef = useRef(null);
  useAdminCheck();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Không tìm thấy token. Vui lòng đăng nhập lại.");
      window.location.href = "/login";
      return;
    }

    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }

    const table = $(tableRef.current).DataTable({
      processing: true,
      serverSide: true,
      ajax: (data, callback) => {
        const page = Math.floor(data.start / data.length) + 1;
        const limit = data.length;

        axios
          .get(
            `${backendUrl}/api/speaking-questions?page=${page}&limit=${limit}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .then((res) => {
            const formattedData = res.data.data.map((item) => ({
              ...item,
              part: item.part?.name || "Không xác định",
            }));
            callback({
              draw: data.draw,
              data: formattedData,
              recordsTotal: res.data.total || 0,
              recordsFiltered: res.data.total || 0,
            });
          })
          .catch((err) => {
            console.error("Lỗi:", err);
            callback({
              draw: data.draw,
              data: [],
              recordsTotal: 0,
              recordsFiltered: 0,
            });

            if ([401, 403].includes(err.response?.status)) {
              alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
              logout();
              window.location.href = "/login";
            }
          });
      },
      columns: [
        { data: "_id" },
        { data: "part" },
        { data: "type" },
        { data: "question" },
        { data: "sampleAnswer" },
        { data: "topic" },
        {
          data: null,
          render: (q) =>
            q.image
              ? `<img src="${q.image}" alt="Hình" width="60" onerror="this.src='placeholder-image.jpg';"/>`
              : "-",
        },
        {
          data: null,
          render: (q) => `
            <button class="action-btn" data-id="${q._id}" data-action="detail">Chi tiết</button> |
            <button class="action-btn" data-id="${q._id}" data-action="edit">Sửa</button> |
            <button class="action-btn" data-id="${q._id}" data-action="delete">Xóa</button>
          `,
        },
      ],
      pageLength: 10,
      responsive: true,
      destroy: true,
      language: {
        emptyTable: "Không có dữ liệu",
        info: "Hiển thị _START_ đến _END_ trong _TOTAL_ mục",
        infoEmpty: "Hiển thị 0 đến 0 trong 0 mục",
        infoFiltered: "(lọc từ _MAX_ mục)",
        lengthMenu: "Hiển thị _MENU_ mục",
        loadingRecords: "Đang tải...",
        processing: "Đang xử lý...",
        paginate: {
          first: "Đầu",
          last: "Cuối",
          next: "Tiếp",
          previous: "Trước",
        },
        search: "Tìm kiếm:",
      },
    });

    $(tableRef.current).on("click", ".action-btn", function () {
      const id = $(this).data("id");
      const action = $(this).data("action");
      if (ACTIONS[action]) ACTIONS[action](id);
    });

    return () => {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        table.destroy();
      }
    };
  }, []);

  const handleDetail = (id) => {
    window.open(`/speaking/${id}`, "_blank");
  };

  const handleEdit = (id) => {
    window.open(`/speaking/edit/${id}`, "_blank");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${backendUrl}/api/speaking-questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      $(tableRef.current).DataTable().ajax.reload();
      alert("Xóa thành công!");
    } catch (err) {
      alert(
        "Lỗi khi xóa: " +
          (err.response?.data?.message || err.message || "Kết nối thất bại")
      );
    }
  };

  const ACTIONS = {
    detail: handleDetail,
    edit: handleEdit,
    delete: handleDelete,
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: 15 }}>
        🎙️ Danh sách câu hỏi Speaking
      </h2>
      <div style={{ marginBottom: 15 }}>
        <button
          onClick={logout}
          style={{
            padding: "8px 16px",
            background: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}>
          Đăng xuất
        </button>
        <Link to="/speaking/create" style={{ marginLeft: 10 }}>
          <button
            style={{
              padding: "8px 16px",
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}>
            Tạo câu hỏi mới
          </button>
        </Link>
      </div>

      <table ref={tableRef} className="display" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Phần</th>
            <th>Loại</th>
            <th>Nội dung câu hỏi</th>
            <th>Đáp án mẫu</th>
            <th>Chủ đề</th>
            <th>Hình ảnh</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  );
}
