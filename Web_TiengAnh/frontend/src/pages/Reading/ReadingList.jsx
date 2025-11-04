import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import $ from "jquery";
import "datatables.net";
import { useAdminCheck, logout } from "../../utils/auth";

const backendUrl = "http://localhost:3000";

export default function ReadingList() {
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
            `${backendUrl}/api/reading-questions?page=${page}&limit=${limit}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .then((res) => {
            callback({
              draw: data.draw,
              data: res.data.data || [],
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
        { data: "type" },
        { data: null, render: renderers.question },
        { data: null, render: renderers.answer },
        { data: null, render: (q) => q.part?.name || q.part || "-" },
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
    window.open(`/reading/${id}`, "_blank");
  };

  const handleEdit = (id) => {
    window.open(`/reading/edit/${id}`, "_blank");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${backendUrl}/api/reading-questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      $(tableRef.current).DataTable().ajax.reload();
      alert("Xóa thành công!");
    } catch (err) {
      alert(
        "Lỗi khi xóa: " +
          (err.response?.data?.error || err.message || "Kết nối thất bại")
      );
    }
  };

  const ACTIONS = {
    detail: handleDetail,
    edit: handleEdit,
    delete: handleDelete,
  };

  const renderers = {
    question: (q) => {
      const map = {
        multiple_choice: q.multipleChoice?.question,
        short_answer: q.shortAnswer?.question,
        matching: q.matching?.question,
        sentence_completion: q.sentenceCompletion?.sentenceWithBlank,
        summary_completion: q.summaryCompletion?.instruction,
        diagram_label_completion: q.diagramLabelCompletion?.diagramUrl,
      };
      return map[q.type] || q.content || "-";
    },
    answer: (q) => {
      const map = {
        multiple_choice: q.multipleChoice?.answer,
        short_answer: q.shortAnswer?.answer,
        matching: (q.matching?.correctMatches || []).join(", "),
        sentence_completion: q.sentenceCompletion?.answer,
        summary_completion: (q.summaryCompletion?.answers || []).join(", "),
        diagram_label_completion: (
          q.diagramLabelCompletion?.correctLabels || []
        ).join(", "),
      };
      return map[q.type] || "-";
    },
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📘 Danh sách câu hỏi Reading</h2>
      <div style={{ marginBottom: 15 }}>
        <button onClick={logout}>Đăng xuất</button>
        <Link to="/reading/create" style={{ marginLeft: 10 }}>
          <button>Tạo câu hỏi mới</button>
        </Link>
      </div>

      <table ref={tableRef} className="display" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Loại</th>
            <th>Nội dung câu hỏi</th>
            <th>Đáp án</th>
            <th>Phần</th>
            <th>Hình ảnh</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  );
}
