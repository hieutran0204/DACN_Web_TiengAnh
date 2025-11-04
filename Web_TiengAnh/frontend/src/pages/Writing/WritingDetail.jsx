import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdminCheck } from "../../utils/auth";

export default function WritingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  useAdminCheck();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Không tìm thấy token. Vui lòng đăng nhập lại.");
      window.location.href = "/login";
      return;
    }

    axios
      .get(`http://localhost:3000/api/writing-questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setQuestion(res.data.data);
      })
      .catch((err) => {
        if ([401, 403].includes(err.response?.status)) {
          alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          localStorage.clear();
          window.location.href = "/login";
        } else {
          alert(
            "Lỗi lấy chi tiết: " + (err.response?.data?.error || err.message)
          );
        }
      });
  }, [id]);

  if (!question) return <div className="p-6 text-gray-600">Đang tải...</div>;

  const renderQuestionContent = () => (
    <div className="space-y-2">
      <p>
        <b>Câu hỏi:</b> {question.question || "N/A"}
      </p>
      <p>
        <b>Đáp án mẫu:</b> {question.sampleAnswer || "N/A"}
      </p>

      {question.suggestedIdeas?.length > 0 && (
        <div>
          <p>
            <b>Ý tưởng gợi ý:</b>
          </p>
          <ul className="list-disc pl-5">
            {question.suggestedIdeas.map((idea, i) => (
              <li key={i}>{idea || "Ý tưởng trống"}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Chi tiết câu hỏi Writing
        </h2>
        <div className="space-x-2">
          <button
            onClick={() => navigate(`/writing/edit/${id}`)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Chỉnh sửa
          </button>
          <button
            onClick={() => navigate("/writing")}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">
            Quay lại
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <p>
          <b>ID:</b> {question._id}
        </p>
        <p>
          <b>Phần:</b> {question.part?.name || "Không xác định"}
        </p>
        <p>
          <b>Task:</b> {question.task || "N/A"}
        </p>
        <p>
          <b>Loại:</b> {question.type?.replace(/_/g, " ") || "N/A"}
        </p>
        <p>
          <b>Chủ đề:</b> {question.topic || "N/A"}
        </p>
        <p>
          <b>Kỹ năng:</b> {question.skill?.name || "Không xác định"}
        </p>
        <p>
          <b>Độ khó:</b>{" "}
          {question.difficulty === "easy"
            ? "Dễ"
            : question.difficulty === "medium"
              ? "Trung bình"
              : "Khó"}
        </p>
        <p>
          <b>Ngày tạo:</b>{" "}
          {new Date(question.createdAt).toLocaleString("vi-VN")}
        </p>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Nội dung câu hỏi
          </h3>
          {renderQuestionContent()}
        </div>
      </div>
    </div>
  );
}
