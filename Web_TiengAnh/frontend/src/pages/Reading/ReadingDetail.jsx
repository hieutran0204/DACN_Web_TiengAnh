import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdminCheck } from "../../utils/auth";

export default function ReadingDetail() {
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
      .get(`http://localhost:3000/api/reading-questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setQuestion(res.data.data);
      })
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

  const renderQuestionContent = () => {
    if (!question)
      return <p className="text-gray-500">Không có nội dung câu hỏi.</p>;

    switch (question.type) {
      case "multiple_choice":
        return (
          <div className="space-y-2">
            <p>
              <b>Câu hỏi:</b> {question.multipleChoice?.question || "N/A"}
            </p>
            <p>
              <b>Tùy chọn:</b>
            </p>
            <ul className="list-disc pl-5">
              {question.multipleChoice?.options?.map((opt, i) => (
                <li key={i}>{opt || "Tùy chọn trống"}</li>
              )) || <li>Không có tùy chọn</li>}
            </ul>
            <p>
              <b>Đáp án:</b> {question.multipleChoice?.answer || "N/A"}
            </p>
          </div>
        );
      case "true_false_not_given":
      case "yes_no_not_given":
        return (
          <div className="space-y-2">
            <p>
              <b>Câu hỏi:</b> {question[question.type]?.statement || "N/A"}
            </p>
            <p>
              <b>Đáp án:</b> {question[question.type]?.answer || "N/A"}
            </p>
          </div>
        );
      case "matching_headings":
        return (
          <div className="space-y-2">
            <p>
              <b>Đoạn văn:</b> {question.matchingHeadings?.paragraph || "N/A"}
            </p>
            <p>
              <b>Các tiêu đề:</b>
            </p>
            <ul className="list-disc pl-5">
              {question.matchingHeadings?.headings?.map((h, i) => (
                <li key={i}>{h || "Tiêu đề trống"}</li>
              )) || <li>Không có tiêu đề</li>}
            </ul>
            <p>
              <b>Tiêu đề đúng:</b>{" "}
              {question.matchingHeadings?.correctHeading || "N/A"}
            </p>
          </div>
        );
      case "matching_information":
        return (
          <div className="space-y-2">
            <p>
              <b>Thông tin:</b>{" "}
              {question.matchingInformation?.infoText || "N/A"}
            </p>
            <p>
              <b>Nhãn đoạn văn:</b>{" "}
              {question.matchingInformation?.paragraphLabel || "N/A"}
            </p>
          </div>
        );
      case "matching_features":
        return (
          <div className="space-y-2">
            <p>
              <b>Mục:</b> {question.matchingFeatures?.item || "N/A"}
            </p>
            <p>
              <b>Các đặc điểm:</b>
            </p>
            <ul className="list-disc pl-5">
              {question.matchingFeatures?.features?.map((f, i) => (
                <li key={i}>{f || "Đặc điểm trống"}</li>
              )) || <li>Không có đặc điểm</li>}
            </ul>
            <p>
              <b>Đặc điểm đúng:</b>{" "}
              {question.matchingFeatures?.matchedFeature || "N/A"}
            </p>
          </div>
        );
      case "matching_sentence_endings":
        return (
          <div className="space-y-2">
            <p>
              <b>Câu bắt đầu:</b>{" "}
              {question.matchingSentenceEndings?.start || "N/A"}
            </p>
            <p>
              <b>Các kết thúc:</b>
            </p>
            <ul className="list-disc pl-5">
              {question.matchingSentenceEndings?.endings?.map((e, i) => (
                <li key={i}>{e || "Kết thúc trống"}</li>
              )) || <li>Không có kết thúc</li>}
            </ul>
            <p>
              <b>Kết thúc đúng:</b>{" "}
              {question.matchingSentenceEndings?.correctEnding || "N/A"}
            </p>
          </div>
        );
      case "sentence_completion":
        return (
          <div className="space-y-2">
            <p>
              <b>Câu có chỗ trống:</b>{" "}
              {question.sentenceCompletion?.sentenceWithBlank || "N/A"}
            </p>
            <p>
              <b>Đáp án:</b> {question.sentenceCompletion?.answer || "N/A"}
            </p>
            <p>
              <b>Giới hạn từ:</b>{" "}
              {question.sentenceCompletion?.wordLimit || "Không giới hạn"}
            </p>
          </div>
        );
      case "summary_completion":
        return (
          <div className="space-y-2">
            <p>
              <b>Tóm tắt:</b> {question.summaryCompletion?.summaryText || "N/A"}
            </p>
            <p>
              <b>Chỗ trống:</b>
            </p>
            <ul className="list-disc pl-5">
              {question.summaryCompletion?.blanks?.map((b, i) => (
                <li key={i}>{b || "Chỗ trống"}</li>
              )) || <li>Không có chỗ trống</li>}
            </ul>
            <p>
              <b>Đáp án:</b>
            </p>
            <ul className="list-disc pl-5">
              {question.summaryCompletion?.answers?.map((a, i) => (
                <li key={i}>{a || "Đáp án trống"}</li>
              )) || <li>Không có đáp án</li>}
            </ul>
            <p>
              <b>Giới hạn từ:</b>{" "}
              {question.summaryCompletion?.wordLimit || "Không giới hạn"}
            </p>
          </div>
        );
      case "diagram_label_completion":
        return (
          <div className="space-y-2">
            <p>
              <b>URL sơ đồ:</b>{" "}
              {question.diagramLabelCompletion?.diagramUrl || "N/A"}
            </p>
            {question.diagramLabelCompletion?.diagramUrl && (
              <img
                src={question.diagramLabelCompletion?.diagramUrl}
                alt="Diagram"
                className="max-w-sm rounded-md object-cover"
              />
            )}
            <p>
              <b>Nhãn:</b>
            </p>
            <ul className="list-disc pl-5">
              {question.diagramLabelCompletion?.labels?.map((l, i) => (
                <li key={i}>{l || "Nhãn trống"}</li>
              )) || <li>Không có nhãn</li>}
            </ul>
            <p>
              <b>Nhãn đúng:</b>
            </p>
            <ul className="list-disc pl-5">
              {question.diagramLabelCompletion?.correctLabels?.map((cl, i) => (
                <li key={i}>{cl || "Nhãn đúng trống"}</li>
              )) || <li>Không có nhãn đúng</li>}
            </ul>
          </div>
        );
      default:
        return <p className="text-gray-500">Loại câu hỏi không xác định.</p>;
    }
  };

  if (!question) return <div className="p-6 text-gray-600">Đang tải...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Chi tiết câu hỏi Reading
        </h2>
        <div className="space-x-2">
          <button
            onClick={() => navigate(`/reading/edit/${id}`)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Chỉnh sửa
          </button>
          <button
            onClick={() => navigate("/reading")}
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
          <b>Loại:</b> {question.type || "N/A"}
        </p>
        <p>
          <b>Phần:</b> {question.part?.name || question.part || "N/A"}
        </p>
        <p>
          <b>Nội dung:</b> {question.content || "Không có nội dung"}
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
          <b>Giải thích:</b> {question.explanation || "Không có giải thích"}
        </p>
        <p>
          <b>Ngày tạo:</b>{" "}
          {new Date(question.createdAt).toLocaleString("vi-VN")}
        </p>
        {question.image && (
          <div>
            <p>
              <b>Hình ảnh:</b>
            </p>
            <img
              src={question.image}
              alt="Question Image"
              className="max-w-sm rounded-md object-cover"
            />
          </div>
        )}
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
