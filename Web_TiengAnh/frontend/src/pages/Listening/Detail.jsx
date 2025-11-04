import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdminCheck } from "../../utils/auth";

export default function ListeningDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const navigate = useNavigate();
  useAdminCheck(); // Kiểm tra admin

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://localhost:3000/api/listening-questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setQuestion(res.data.data))
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert(
            "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
          );
          localStorage.removeItem("token");
          localStorage.removeItem("roleId");
          localStorage.removeItem("role");
          window.location.href = "/login";
        } else {
          alert(
            "Lỗi lấy chi tiết: " + (err.response?.data?.error || err.message)
          );
        }
      });
  }, [id]);

  if (!question) return <p>Đang tải...</p>;

  const renderTypeSpecificFields = () => {
    switch (question.type) {
      case "multiple_choice":
        return (
          <div>
            <p>
              <b>Câu hỏi:</b> {question.multipleChoice?.question || "-"}
            </p>
            <p>
              <b>Tùy chọn:</b>{" "}
              {question.multipleChoice?.options?.join(", ") || "-"}
            </p>
            <p>
              <b>Đáp án:</b> {question.multipleChoice?.answer || "-"}
            </p>
          </div>
        );

      case "short_answer":
        return (
          <div>
            <p>
              <b>Câu hỏi:</b> {question.shortAnswer?.question || "-"}
            </p>
            <p>
              <b>Đáp án:</b> {question.shortAnswer?.answer || "-"}
            </p>
            <p>
              <b>Giới hạn từ:</b> {question.shortAnswer?.wordLimit || "-"}
            </p>
          </div>
        );

      case "matching":
        return (
          <div>
            <p>
              <b>Câu hỏi:</b> {question.matching?.question || "-"}
            </p>
            <p>
              <b>Mục:</b> {question.matching?.items?.join(", ") || "-"}
            </p>
            <p>
              <b>Tùy chọn:</b> {question.matching?.options?.join(", ") || "-"}
            </p>
            <p>
              <b>Đáp án đúng:</b>{" "}
              {question.matching?.correctMatches?.join(", ") || "-"}
            </p>
          </div>
        );

      case "form_note_table_completion":
        return (
          <div>
            <p>
              <b>Hướng dẫn:</b>{" "}
              {question.formNoteTableCompletion?.instruction || "-"}
            </p>
            <p>
              <b>Chỗ trống:</b>{" "}
              {question.formNoteTableCompletion?.blanks?.join(", ") || "-"}
            </p>
            <p>
              <b>Đáp án:</b>{" "}
              {question.formNoteTableCompletion?.answers?.join(", ") || "-"}
            </p>
            <p>
              <b>Giới hạn từ:</b>{" "}
              {question.formNoteTableCompletion?.wordLimit || "-"}
            </p>
          </div>
        );

      case "plan_map_diagram_labelling":
        return (
          <div>
            <p>
              <b>URL sơ đồ:</b>{" "}
              {question.planMapDiagramLabelling?.diagramUrl || "-"}
            </p>
            <p>
              <b>Nhãn:</b>{" "}
              {question.planMapDiagramLabelling?.labels?.join(", ") || "-"}
            </p>
            <p>
              <b>Nhãn đúng:</b>{" "}
              {question.planMapDiagramLabelling?.correctLabels?.join(", ") ||
                "-"}
            </p>
          </div>
        );

      case "sentence_completion":
        return (
          <div>
            <p>
              <b>Câu có chỗ trống:</b>{" "}
              {question.sentenceCompletion?.sentenceWithBlank || "-"}
            </p>
            <p>
              <b>Đáp án:</b> {question.sentenceCompletion?.answer || "-"}
            </p>
            <p>
              <b>Giới hạn từ:</b>{" "}
              {question.sentenceCompletion?.wordLimit || "-"}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Chi tiết câu hỏi</h2>
      <p>
        <b>ID:</b> {question._id}
      </p>
      <p>
        <b>Loại:</b> {question.type}
      </p>
      <p>
        <b>Part:</b> {question.part?.name || question.part}
      </p>
      <p>
        <b>Nội dung:</b> {question.content || "-"}
      </p>
      <p>
        <b>Độ khó:</b> {question.difficulty}
      </p>

      {question.audio && (
        <>
          <p>
            <b>Audio:</b>
          </p>
          <audio controls src={`http://localhost:3000${question.audio}`} />
        </>
      )}

      {question.image && (
        <>
          <p>
            <b>Hình ảnh:</b>
          </p>
          <img
            src={`http://localhost:3000${question.image}`}
            alt="Question"
            style={{ width: 200 }}
          />
        </>
      )}

      {/* Hiển thị các trường đặc trưng theo type */}
      {renderTypeSpecificFields()}

      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => navigate(`/listening/edit/${id}`)}
          style={{ marginRight: 10 }}>
          Sửa
        </button>
        <button onClick={() => navigate("/listening")}>Quay lại</button>
      </div>
    </div>
  );
}
