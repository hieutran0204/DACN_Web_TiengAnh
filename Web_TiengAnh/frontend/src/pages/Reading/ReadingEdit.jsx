import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdminCheck } from "../../utils/auth";

export default function EditReadingQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useAdminCheck();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Không tìm thấy token. Vui lòng đăng nhập lại.");
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    axios
      .get(`http://localhost:3000/api/reading-questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setQuestion({
          ...res.data.data,
          part: res.data.data.part?._id || res.data.data.part,
        });
      })
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          localStorage.removeItem("roleId");
          localStorage.removeItem("role");
          window.location.href = "/login";
        } else {
          setError(
            "Không thể tải thông tin câu hỏi: " +
              (err.response?.data?.message || err.message)
          );
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setQuestion((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value || "" },
    }));
  };

  const handleArrayChange = (section, field, index, value) => {
    const updatedArray = [...(question[section]?.[field] || [])];
    updatedArray[index] = value || "";
    setQuestion((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: updatedArray },
    }));
  };

  const addToArray = (section, field) => {
    setQuestion((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section]?.[field] || []), ""],
      },
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const validateForm = () => {
    if (!question?.part) return "Vui lòng chọn phần (Part).";
    if (!question?.type) return "Vui lòng chọn loại câu hỏi.";

    switch (question.type) {
      case "multiple_choice":
        if (!question.multipleChoice?.question)
          return "Vui lòng nhập câu hỏi cho multiple_choice.";
        if (question.multipleChoice?.options?.some((opt) => !opt))
          return "Vui lòng nhập đầy đủ các tùy chọn.";
        if (!question.multipleChoice?.answer)
          return "Vui lòng nhập đáp án cho multiple_choice.";
        break;
      case "true_false_not_given":
        if (!question.trueFalseNotGiven?.statement)
          return "Vui lòng nhập nội dung câu hỏi cho true_false_not_given.";
        break;
      case "yes_no_not_given":
        if (!question.yesNoNotGiven?.statement)
          return "Vui lòng nhập nội dung câu hỏi cho yes_no_not_given.";
        break;
      case "matching_headings":
        if (!question.matchingHeadings?.paragraph)
          return "Vui lòng nhập đoạn văn cho matching_headings.";
        if (question.matchingHeadings?.headings?.some((h) => !h))
          return "Vui lòng nhập đầy đủ các tiêu đề.";
        if (!question.matchingHeadings?.correctHeading)
          return "Vui lòng nhập tiêu đề đúng.";
        break;
      case "matching_information":
        if (!question.matchingInformation?.infoText)
          return "Vui lòng nhập thông tin cho matching_information.";
        if (!question.matchingInformation?.paragraphLabel)
          return "Vui lòng nhập nhãn đoạn văn.";
        break;
      case "matching_features":
        if (!question.matchingFeatures?.item)
          return "Vui lòng nhập mục cho matching_features.";
        if (question.matchingFeatures?.features?.some((f) => !f))
          return "Vui lòng nhập đầy đủ các đặc điểm.";
        if (!question.matchingFeatures?.matchedFeature)
          return "Vui lòng nhập đặc điểm đúng.";
        break;
      case "matching_sentence_endings":
        if (!question.matchingSentenceEndings?.start)
          return "Vui lòng nhập câu bắt đầu cho matching_sentence_endings.";
        if (question.matchingSentenceEndings?.endings?.some((e) => !e))
          return "Vui lòng nhập đầy đủ các kết thúc.";
        if (!question.matchingSentenceEndings?.correctEnding)
          return "Vui lòng nhập kết thúc đúng.";
        break;
      case "sentence_completion":
        if (!question.sentenceCompletion?.sentenceWithBlank)
          return "Vui lòng nhập câu có chỗ trống cho sentence_completion.";
        if (!question.sentenceCompletion?.answer)
          return "Vui lòng nhập đáp án cho sentence_completion.";
        break;
      case "summary_completion":
        if (!question.summaryCompletion?.summaryText)
          return "Vui lòng nhập tóm tắt cho summary_completion.";
        if (question.summaryCompletion?.blanks?.some((b) => !b))
          return "Vui lòng nhập đầy đủ các chỗ trống.";
        if (question.summaryCompletion?.answers?.some((a) => !a))
          return "Vui lòng nhập đầy đủ các đáp án.";
        break;
      case "diagram_label_completion":
        if (!question.diagramLabelCompletion?.diagramUrl)
          return "Vui lòng nhập URL sơ đồ cho diagram_label_completion.";
        if (question.diagramLabelCompletion?.labels?.some((l) => !l))
          return "Vui lòng nhập đầy đủ các nhãn.";
        if (question.diagramLabelCompletion?.correctLabels?.some((cl) => !cl))
          return "Vui lòng nhập đầy đủ các nhãn đúng.";
        break;
      default:
        return "Loại câu hỏi không hợp lệ.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    const formData = new FormData();
    const token = localStorage.getItem("token");

    formData.append("part", question.part || "");
    formData.append("type", question.type || "");
    formData.append("content", question.content || "");
    formData.append("difficult", question.difficult || "");
    formData.append("explanation", question.explanation || "");
    if (image) {
      formData.append("image", image);
    } else if (question.image) {
      formData.append("image", question.image); // Giữ URL hình ảnh cũ
    }

    if (question.type === "multiple_choice") {
      formData.append(
        "multipleChoice[question]",
        question.multipleChoice?.question || ""
      );
      (question.multipleChoice?.options || []).forEach((opt, i) =>
        formData.append(`multipleChoice[options][${i}]`, opt || "")
      );
      formData.append(
        "multipleChoice[answer]",
        question.multipleChoice?.answer || ""
      );
    } else if (question.type === "true_false_not_given") {
      formData.append(
        "trueFalseNotGiven[statement]",
        question.trueFalseNotGiven?.statement || ""
      );
      formData.append(
        "trueFalseNotGiven[answer]",
        question.trueFalseNotGiven?.answer || ""
      );
    } else if (question.type === "yes_no_not_given") {
      formData.append(
        "yesNoNotGiven[statement]",
        question.yesNoNotGiven?.statement || ""
      );
      formData.append(
        "yesNoNotGiven[answer]",
        question.yesNoNotGiven?.answer || ""
      );
    } else if (question.type === "matching_headings") {
      formData.append(
        "matchingHeadings[paragraph]",
        question.matchingHeadings?.paragraph || ""
      );
      (question.matchingHeadings?.headings || []).forEach((h, i) =>
        formData.append(`matchingHeadings[headings][${i}]`, h || "")
      );
      formData.append(
        "matchingHeadings[correctHeading]",
        question.matchingHeadings?.correctHeading || ""
      );
    } else if (question.type === "matching_information") {
      formData.append(
        "matchingInformation[infoText]",
        question.matchingInformation?.infoText || ""
      );
      formData.append(
        "matchingInformation[paragraphLabel]",
        question.matchingInformation?.paragraphLabel || ""
      );
    } else if (question.type === "matching_features") {
      formData.append(
        "matchingFeatures[item]",
        question.matchingFeatures?.item || ""
      );
      (question.matchingFeatures?.features || []).forEach((f, i) =>
        formData.append(`matchingFeatures[features][${i}]`, f || "")
      );
      formData.append(
        "matchingFeatures[matchedFeature]",
        question.matchingFeatures?.matchedFeature || ""
      );
    } else if (question.type === "matching_sentence_endings") {
      formData.append(
        "matchingSentenceEndings[start]",
        question.matchingSentenceEndings?.start || ""
      );
      (question.matchingSentenceEndings?.endings || []).forEach((e, i) =>
        formData.append(`matchingSentenceEndings[endings][${i}]`, e || "")
      );
      formData.append(
        "matchingSentenceEndings[correctEnding]",
        question.matchingSentenceEndings?.correctEnding || ""
      );
    } else if (question.type === "sentence_completion") {
      formData.append(
        "sentenceCompletion[sentenceWithBlank]",
        question.sentenceCompletion?.sentenceWithBlank || ""
      );
      formData.append(
        "sentenceCompletion[answer]",
        question.sentenceCompletion?.answer || ""
      );
      formData.append(
        "sentenceCompletion[wordLimit]",
        question.sentenceCompletion?.wordLimit || ""
      );
    } else if (question.type === "summary_completion") {
      formData.append(
        "summaryCompletion[summaryText]",
        question.summaryCompletion?.summaryText || ""
      );
      (question.summaryCompletion?.blanks || []).forEach((b, i) =>
        formData.append(`summaryCompletion[blanks][${i}]`, b || "")
      );
      (question.summaryCompletion?.answers || []).forEach((a, i) =>
        formData.append(`summaryCompletion[answers][${i}]`, a || "")
      );
      formData.append(
        "summaryCompletion[wordLimit]",
        question.summaryCompletion?.wordLimit || ""
      );
    } else if (question.type === "diagram_label_completion") {
      formData.append(
        "diagramLabelCompletion[diagramUrl]",
        question.diagramLabelCompletion?.diagramUrl || ""
      );
      (question.diagramLabelCompletion?.labels || []).forEach((l, i) =>
        formData.append(`diagramLabelCompletion[labels][${i}]`, l || "")
      );
      (question.diagramLabelCompletion?.correctLabels || []).forEach((cl, i) =>
        formData.append(`diagramLabelCompletion[correctLabels][${i}]`, cl || "")
      );
    }

    try {
      const response = await axios.put(
        `http://localhost:3000/api/reading-questions/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        alert("✅ Cập nhật câu hỏi thành công!");
        navigate("/reading");
      } else {
        alert(
          "❌ Cập nhật thất bại: " +
            (response.data.message || "Lỗi không xác định")
        );
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("roleId");
        localStorage.removeItem("role");
        window.location.href = "/login";
      } else {
        alert(
          "❌ Lỗi cập nhật: " + (err.response?.data?.message || err.message)
        );
      }
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-600">Lỗi: {error}</div>;
  if (!question)
    return <div className="p-6 text-gray-600">Không tìm thấy câu hỏi.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Chỉnh sửa câu hỏi Reading
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phần (Part)
          </label>
          <input
            value={question.part || ""}
            readOnly
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Loại câu hỏi
          </label>
          <input
            name="type"
            value={question.type || ""}
            readOnly
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nội dung
          </label>
          <textarea
            name="content"
            value={question.content || ""}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hình ảnh hiện tại
          </label>
          {question.image ? (
            <img
              src={question.image}
              alt="Current Image"
              className="mt-2 max-w-xs rounded-md object-cover"
            />
          ) : (
            <p className="mt-2 text-gray-500">Không có hình ảnh</p>
          )}
          <label className="block text-sm font-medium text-gray-700 mt-2">
            Tải hình ảnh mới (tùy chọn)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Độ khó
          </label>
          <select
            name="difficult"
            value={question.difficult || "medium"}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Giải thích
          </label>
          <textarea
            name="explanation"
            value={question.explanation || ""}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            rows={4}
          />
        </div>

        {question.type === "multiple_choice" && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700">
              Câu hỏi
            </label>
            <input
              value={question.multipleChoice?.question || ""}
              onChange={(e) =>
                handleNestedChange("multipleChoice", "question", e.target.value)
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Tùy chọn
            </label>
            {(question.multipleChoice?.options || []).map((opt, i) => (
              <input
                key={i}
                value={opt || ""}
                placeholder={`Tùy chọn ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange(
                    "multipleChoice",
                    "options",
                    i,
                    e.target.value
                  )
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            ))}
            <button
              type="button"
              onClick={() => addToArray("multipleChoice", "options")}
              className="mt-2 text-blue-600 hover:underline">
              + Thêm tùy chọn
            </button>
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Đáp án
            </label>
            <input
              value={question.multipleChoice?.answer || ""}
              onChange={(e) =>
                handleNestedChange("multipleChoice", "answer", e.target.value)
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
        )}

        {["true_false_not_given", "yes_no_not_given"].includes(
          question.type
        ) && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700">
              Câu hỏi
            </label>
            <input
              value={question[question.type]?.statement || ""}
              onChange={(e) =>
                handleNestedChange(question.type, "statement", e.target.value)
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Đáp án
            </label>
            <select
              value={question[question.type]?.answer || ""}
              onChange={(e) =>
                handleNestedChange(question.type, "answer", e.target.value)
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required>
              {question.type === "true_false_not_given" ? (
                <>
                  <option value="True">True</option>
                  <option value="False">False</option>
                  <option value="Not Given">Not Given</option>
                </>
              ) : (
                <>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Not Given">Not Given</option>
                </>
              )}
            </select>
          </div>
        )}

        {question.type === "matching_headings" && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700">
              Đoạn văn
            </label>
            <textarea
              value={question.matchingHeadings?.paragraph || ""}
              onChange={(e) =>
                handleNestedChange(
                  "matchingHeadings",
                  "paragraph",
                  e.target.value
                )
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
              rows={4}
            />
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Các tiêu đề
            </label>
            {(question.matchingHeadings?.headings || []).map((h, i) => (
              <input
                key={i}
                value={h || ""}
                placeholder={`Tiêu đề ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange(
                    "matchingHeadings",
                    "headings",
                    i,
                    e.target.value
                  )
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            ))}
            <button
              type="button"
              onClick={() => addToArray("matchingHeadings", "headings")}
              className="mt-2 text-blue-600 hover:underline">
              + Thêm tiêu đề
            </button>
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Tiêu đề đúng
            </label>
            <input
              value={question.matchingHeadings?.correctHeading || ""}
              onChange={(e) =>
                handleNestedChange(
                  "matchingHeadings",
                  "correctHeading",
                  e.target.value
                )
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
        )}

        {question.type === "matching_information" && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700">
              Thông tin
            </label>
            <textarea
              value={question.matchingInformation?.infoText || ""}
              onChange={(e) =>
                handleNestedChange(
                  "matchingInformation",
                  "infoText",
                  e.target.value
                )
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
              rows={4}
            />
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Nhãn đoạn văn
            </label>
            <input
              value={question.matchingInformation?.paragraphLabel || ""}
              onChange={(e) =>
                handleNestedChange(
                  "matchingInformation",
                  "paragraphLabel",
                  e.target.value
                )
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
        )}

        {question.type === "matching_features" && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700">
              Mục
            </label>
            <input
              value={question.matchingFeatures?.item || ""}
              onChange={(e) =>
                handleNestedChange("matchingFeatures", "item", e.target.value)
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Các đặc điểm
            </label>
            {(question.matchingFeatures?.features || []).map((f, i) => (
              <input
                key={i}
                value={f || ""}
                placeholder={`Đặc điểm ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange(
                    "matchingFeatures",
                    "features",
                    i,
                    e.target.value
                  )
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            ))}
            <button
              type="button"
              onClick={() => addToArray("matchingFeatures", "features")}
              className="mt-2 text-blue-600 hover:underline">
              + Thêm đặc điểm
            </button>
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Đặc điểm đúng
            </label>
            <input
              value={question.matchingFeatures?.matchedFeature || ""}
              onChange={(e) =>
                handleNestedChange(
                  "matchingFeatures",
                  "matchedFeature",
                  e.target.value
                )
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
        )}

        {question.type === "matching_sentence_endings" && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700">
              Câu bắt đầu
            </label>
            <input
              value={question.matchingSentenceEndings?.start || ""}
              onChange={(e) =>
                handleNestedChange(
                  "matchingSentenceEndings",
                  "start",
                  e.target.value
                )
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Các kết thúc
            </label>
            {(question.matchingSentenceEndings?.endings || []).map((e, i) => (
              <input
                key={i}
                value={e || ""}
                placeholder={`Kết thúc ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange(
                    "matchingSentenceEndings",
                    "endings",
                    i,
                    e.target.value
                  )
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            ))}
            <button
              type="button"
              onClick={() => addToArray("matchingSentenceEndings", "endings")}
              className="mt-2 text-blue-600 hover:underline">
              + Thêm kết thúc
            </button>
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Kết thúc đúng
            </label>
            <input
              value={question.matchingSentenceEndings?.correctEnding || ""}
              onChange={(e) =>
                handleNestedChange(
                  "matchingSentenceEndings",
                  "correctEnding",
                  e.target.value
                )
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
        )}

        {question.type === "sentence_completion" && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700">
              Câu có chỗ trống
            </label>
            <input
              value={question.sentenceCompletion?.sentenceWithBlank || ""}
              onChange={(e) =>
                handleNestedChange(
                  "sentenceCompletion",
                  "sentenceWithBlank",
                  e.target.value
                )
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Đáp án
            </label>
            <input
              value={question.sentenceCompletion?.answer || ""}
              onChange={(e) =>
                handleNestedChange(
                  "sentenceCompletion",
                  "answer",
                  e.target.value
                )
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Giới hạn từ
            </label>
            <input
              type="number"
              value={question.sentenceCompletion?.wordLimit || ""}
              onChange={(e) =>
                handleNestedChange(
                  "sentenceCompletion",
                  "wordLimit",
                  e.target.value
                )
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
        )}

        {question.type === "summary_completion" && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700">
              Tóm tắt
            </label>
            <textarea
              value={question.summaryCompletion?.summaryText || ""}
              onChange={(e) =>
                handleNestedChange(
                  "summaryCompletion",
                  "summaryText",
                  e.target.value
                )
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
              rows={4}
            />
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Chỗ trống
            </label>
            {(question.summaryCompletion?.blanks || []).map((b, i) => (
              <input
                key={i}
                value={b || ""}
                placeholder={`Chỗ trống ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange(
                    "summaryCompletion",
                    "blanks",
                    i,
                    e.target.value
                  )
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            ))}
            <button
              type="button"
              onClick={() => addToArray("summaryCompletion", "blanks")}
              className="mt-2 text-blue-600 hover:underline">
              + Thêm chỗ trống
            </button>
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Đáp án
            </label>
            {(question.summaryCompletion?.answers || []).map((a, i) => (
              <input
                key={i}
                value={a || ""}
                placeholder={`Đáp án ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange(
                    "summaryCompletion",
                    "answers",
                    i,
                    e.target.value
                  )
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            ))}
            <button
              type="button"
              onClick={() => addToArray("summaryCompletion", "answers")}
              className="mt-2 text-blue-600 hover:underline">
              + Thêm đáp án
            </button>
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Giới hạn từ
            </label>
            <input
              type="number"
              value={question.summaryCompletion?.wordLimit || ""}
              onChange={(e) =>
                handleNestedChange(
                  "summaryCompletion",
                  "wordLimit",
                  e.target.value
                )
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
        )}

        {question.type === "diagram_label_completion" && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700">
              URL sơ đồ
            </label>
            <input
              value={question.diagramLabelCompletion?.diagramUrl || ""}
              onChange={(e) =>
                handleNestedChange(
                  "diagramLabelCompletion",
                  "diagramUrl",
                  e.target.value
                )
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Nhãn
            </label>
            {(question.diagramLabelCompletion?.labels || []).map((l, i) => (
              <input
                key={i}
                value={l || ""}
                placeholder={`Nhãn ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange(
                    "diagramLabelCompletion",
                    "labels",
                    i,
                    e.target.value
                  )
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            ))}
            <button
              type="button"
              onClick={() => addToArray("diagramLabelCompletion", "labels")}
              className="mt-2 text-blue-600 hover:underline">
              + Thêm nhãn
            </button>
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Nhãn đúng
            </label>
            {(question.diagramLabelCompletion?.correctLabels || []).map(
              (cl, i) => (
                <input
                  key={i}
                  value={cl || ""}
                  placeholder={`Nhãn đúng ${i + 1}`}
                  onChange={(e) =>
                    handleArrayChange(
                      "diagramLabelCompletion",
                      "correctLabels",
                      i,
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
              )
            )}
            <button
              type="button"
              onClick={() =>
                addToArray("diagramLabelCompletion", "correctLabels")
              }
              className="mt-2 text-blue-600 hover:underline">
              + Thêm nhãn đúng
            </button>
          </div>
        )}

        <div className="flex space-x-4 mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Cập nhật câu hỏi
          </button>
          <button
            type="button"
            onClick={() => navigate("/reading")}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
