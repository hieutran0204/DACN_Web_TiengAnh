import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdminCheck } from "../../utils/auth";

const backendUrl = "http://localhost:3000";

export default function ExamDetail() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const navigate = useNavigate();
  useAdminCheck();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Fetching exam detail with id:", id);
    if (!id || id === "exams") {
      alert("ID không hợp lệ!");
      navigate("/exams");
      return;
    }
    axios
      .get(`${backendUrl}/api/exams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Exam detail received:", res.data.data);
        if (res.data.success && res.data.data) {
          setExam(res.data.data);
        } else {
          console.warn("No valid data in exam response:", res.data);
        }
      })
      .catch((err) =>
        alert("Lỗi: " + (err.response?.data?.message || err.message))
      );
  }, [id, navigate]);

  if (!exam) return <p>Đang tải chi tiết...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>📄 Chi tiết đề thi</h2>
      <p>
        <b>ID:</b> {exam._id}
      </p>
      <p>
        <b>Tiêu đề:</b> {exam.title}
      </p>
      <p>
        <b>Mô tả:</b> {exam.description || "Không có mô tả"}
      </p>
      <p>
        <b>Thời lượng:</b> {exam.durationMinutes || 0} phút
      </p>
      <p>
        <b>Ngày tạo:</b> {new Date(exam.createdAt).toLocaleString()}
      </p>

      <h3>📝 Các câu hỏi đã chọn</h3>
      {["listening", "reading", "speaking", "writing"].map((skill) => {
        const skillQuestions = exam.skills?.[skill] || [];
        if (skillQuestions.length === 0) return null;
        return (
          <div key={skill} style={{ marginBottom: 20 }}>
            <h4>{skill.toUpperCase()}</h4>
            <ul>
              {skillQuestions.map((q) => (
                <li key={q._id} style={{ marginBottom: 10 }}>
                  <b>Câu hỏi:</b>{" "}
                  {q.content || q.question || "Không có nội dung"}
                  <br />
                  <small>Part: {q.part?.name || "Unknown"}</small>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate("/exams")}>⬅️ Quay lại</button>
        <button
          style={{ marginLeft: 10 }}
          onClick={() => navigate(`/exams/edit/${id}`)}>
          ✏️ Chỉnh sửa
        </button>
      </div>
    </div>
  );
}
