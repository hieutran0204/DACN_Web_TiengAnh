import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdminCheck } from "../../utils/auth";

export default function EditListeningQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
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
      .get(`http://localhost:3000/api/listening-questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Dữ liệu câu hỏi:", res.data.data);
        setQuestion(res.data.data);
      })
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          localStorage.removeItem("roleId");
          localStorage.removeItem("role");
          window.location.href = "/login";
        } else {
          console.error("Lỗi tải câu hỏi:", err);
          setError("Không thể tải thông tin câu hỏi.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({ ...prev, [name]: value }));
    console.log(`Đã thay đổi ${name} thành: ${value}`);
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

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "audio") {
      setAudioFile(files[0]);
      console.log("File audio:", files[0]);
    }
    if (name === "image") {
      setImageFile(files[0]);
      console.log("File hình ảnh:", files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Token không hợp lệ. Vui lòng đăng nhập lại.");
      window.location.href = "/login";
      return;
    }

    // Giữ nguyên part từ API, lấy _id một cách an toàn và chỉ dùng chuỗi
    let partId = question.part;
    if (
      question.part &&
      typeof question.part === "object" &&
      question.part._id
    ) {
      partId = question.part._id.toString(); // Chuyển ObjectId thành chuỗi
    } else if (typeof question.part === "string") {
      partId = question.part; // Dùng trực tiếp nếu là chuỗi
    }
    if (!partId) {
      alert("Phần (Part) không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }
    console.log("PartId gửi đi:", partId);

    formData.append("part", partId);
    formData.append("type", question.type || "");
    formData.append("content", question.content || "");
    formData.append("difficulty", question.difficulty || "");

    if (audioFile) {
      formData.append("audio", audioFile);
    } else if (question.audio) {
      formData.append("audio", question.audio); // Gửi URL cũ
    }

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (question.image) {
      formData.append("image", question.image); // Gửi URL cũ
    }

    // Đảm bảo các trường nested có giá trị mặc định
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
    }

    if (question.type === "short_answer") {
      formData.append(
        "shortAnswer[question]",
        question.shortAnswer?.question || ""
      );
      formData.append(
        "shortAnswer[answer]",
        question.shortAnswer?.answer || ""
      );
      formData.append(
        "shortAnswer[wordLimit]",
        question.shortAnswer?.wordLimit || ""
      );
    }

    if (question.type === "matching") {
      formData.append("matching[question]", question.matching?.question || "");
      (question.matching?.items || []).forEach((item, i) =>
        formData.append(`matching[items][${i}]`, item || "")
      );
      (question.matching?.options || []).forEach((opt, i) =>
        formData.append(`matching[options][${i}]`, opt || "")
      );
      (question.matching?.correctMatches || []).forEach((match, i) =>
        formData.append(`matching[correctMatches][${i}]`, match || "")
      );
    }

    if (question.type === "form_note_table_completion") {
      formData.append(
        "formNoteTableCompletion[instruction]",
        question.formNoteTableCompletion?.instruction || ""
      );
      (question.formNoteTableCompletion?.blanks || []).forEach((blank, i) =>
        formData.append(`formNoteTableCompletion[blanks][${i}]`, blank || "")
      );
      (question.formNoteTableCompletion?.answers || []).forEach((answer, i) =>
        formData.append(`formNoteTableCompletion[answers][${i}]`, answer || "")
      );
      formData.append(
        "formNoteTableCompletion[wordLimit]",
        question.formNoteTableCompletion?.wordLimit || ""
      );
    }

    if (question.type === "plan_map_diagram_labelling") {
      formData.append(
        "planMapDiagramLabelling[diagramUrl]",
        question.planMapDiagramLabelling?.diagramUrl || ""
      );
      (question.planMapDiagramLabelling?.labels || []).forEach((label, i) =>
        formData.append(`planMapDiagramLabelling[labels][${i}]`, label || "")
      );
      (question.planMapDiagramLabelling?.correctLabels || []).forEach(
        (label, i) =>
          formData.append(
            `planMapDiagramLabelling[correctLabels][${i}]`,
            label || ""
          )
      );
    }

    if (question.type === "sentence_completion") {
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
    }

    // Debug dữ liệu gửi đi
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await axios.put(
        `http://localhost:3000/api/listening-questions/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Phản hồi server:", response.data);
      if (response.data.success) {
        alert("Cập nhật thành công!");
        navigate("/listening");
        window.location.reload();
      } else {
        alert(
          "Cập nhật thất bại: " +
            (response.data.message || "Lỗi không xác định")
        );
      }
    } catch (err) {
      console.error("Lỗi khi gửi:", err.response?.data || err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("roleId");
        localStorage.removeItem("role");
        window.location.href = "/login";
      } else {
        alert("Lỗi cập nhật: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi: {error}</p>;
  if (!question) return <p>Không tìm thấy câu hỏi.</p>;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>Chỉnh sửa câu hỏi Listening</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>Phần (Part):</label>
        <input
          name="part"
          value={question.part?._id?.toString() || question.part || ""}
          readOnly
        />
        <br />

        <label>Loại:</label>
        <input
          name="type"
          value={question.type || ""}
          onChange={handleChange}
          readOnly
        />
        <br />

        <label>Nội dung:</label>
        <input
          name="content"
          value={question.content || ""}
          onChange={handleChange}
        />
        <br />

        <label>Độ khó:</label>
        <select
          name="difficulty"
          value={question.difficulty}
          onChange={handleChange}>
          <option value="easy">Dễ</option>
          <option value="medium">Trung bình</option>
          <option value="hard">Khó</option>
        </select>
        <br />

        {question.audio && (
          <>
            <label>Audio hiện tại:</label>
            <audio controls src={`http://localhost:3000${question.audio}`} />
            <p>(Chọn file mới để thay thế, để trống để giữ nguyên)</p>
            <br />
          </>
        )}
        <input
          type="file"
          name="audio"
          accept="audio/*"
          onChange={handleFileChange}
        />
        <br />

        {question.image && (
          <>
            <label>Hình ảnh hiện tại:</label>
            <img
              src={`http://localhost:3000${question.image}`}
              width={100}
              alt="Ảnh xem trước"
            />
            <p>(Chọn file mới để thay thế, để trống để giữ nguyên)</p>
            <br />
          </>
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleFileChange}
        />
        <br />

        {question.type === "multiple_choice" && (
          <div>
            <label>Câu hỏi:</label>
            <input
              value={question.multipleChoice?.question || ""}
              onChange={(e) =>
                handleNestedChange("multipleChoice", "question", e.target.value)
              }
            />
            <br />
            <label>Tùy chọn:</label>
            {question.multipleChoice?.options?.map((opt, i) => (
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
              />
            ))}
            <button
              type="button"
              onClick={() => addToArray("multipleChoice", "options")}>
              +
            </button>
            <br />
            <label>Đáp án:</label>
            <input
              value={question.multipleChoice?.answer || ""}
              onChange={(e) =>
                handleNestedChange("multipleChoice", "answer", e.target.value)
              }
            />
          </div>
        )}

        {question.type === "short_answer" && (
          <div>
            <label>Câu hỏi:</label>
            <input
              value={question.shortAnswer?.question || ""}
              onChange={(e) =>
                handleNestedChange("shortAnswer", "question", e.target.value)
              }
            />
            <br />
            <label>Đáp án:</label>
            <input
              value={question.shortAnswer?.answer || ""}
              onChange={(e) =>
                handleNestedChange("shortAnswer", "answer", e.target.value)
              }
            />
            <br />
            <label>Giới hạn từ:</label>
            <input
              value={question.shortAnswer?.wordLimit || ""}
              onChange={(e) =>
                handleNestedChange("shortAnswer", "wordLimit", e.target.value)
              }
            />
          </div>
        )}

        {question.type === "matching" && (
          <div>
            <label>Câu hỏi:</label>
            <input
              value={question.matching?.question || ""}
              onChange={(e) =>
                handleNestedChange("matching", "question", e.target.value)
              }
            />
            <br />
            <label>Mục:</label>
            {question.matching?.items?.map((item, i) => (
              <input
                key={i}
                value={item || ""}
                placeholder={`Mục ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange("matching", "items", i, e.target.value)
                }
              />
            ))}
            <button
              type="button"
              onClick={() => addToArray("matching", "items")}>
              +
            </button>
            <br />
            <label>Tùy chọn:</label>
            {question.matching?.options?.map((opt, i) => (
              <input
                key={i}
                value={opt || ""}
                placeholder={`Tùy chọn ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange("matching", "options", i, e.target.value)
                }
              />
            ))}
            <button
              type="button"
              onClick={() => addToArray("matching", "options")}>
              +
            </button>
            <br />
            <label>Đáp án đúng:</label>
            {question.matching?.correctMatches?.map((match, i) => (
              <input
                key={i}
                value={match || ""}
                placeholder={`Đáp án đúng ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange(
                    "matching",
                    "correctMatches",
                    i,
                    e.target.value
                  )
                }
              />
            ))}
            <button
              type="button"
              onClick={() => addToArray("matching", "correctMatches")}>
              +
            </button>
            <br />
          </div>
        )}

        {question.type === "form_note_table_completion" && (
          <div>
            <label>Hướng dẫn:</label>
            <input
              value={question.formNoteTableCompletion?.instruction || ""}
              onChange={(e) =>
                handleNestedChange(
                  "formNoteTableCompletion",
                  "instruction",
                  e.target.value
                )
              }
            />
            <br />
            <label>Chỗ trống:</label>
            {question.formNoteTableCompletion?.blanks?.map((blank, i) => (
              <input
                key={i}
                value={blank || ""}
                placeholder={`Chỗ trống ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange(
                    "formNoteTableCompletion",
                    "blanks",
                    i,
                    e.target.value
                  )
                }
              />
            ))}
            <button
              type="button"
              onClick={() => addToArray("formNoteTableCompletion", "blanks")}>
              +
            </button>
            <br />
            <label>Đáp án:</label>
            {question.formNoteTableCompletion?.answers?.map((answer, i) => (
              <input
                key={i}
                value={answer || ""}
                placeholder={`Đáp án ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange(
                    "formNoteTableCompletion",
                    "answers",
                    i,
                    e.target.value
                  )
                }
              />
            ))}
            <button
              type="button"
              onClick={() => addToArray("formNoteTableCompletion", "answers")}>
              +
            </button>
            <br />
            <label>Giới hạn từ:</label>
            <input
              value={question.formNoteTableCompletion?.wordLimit || ""}
              onChange={(e) =>
                handleNestedChange(
                  "formNoteTableCompletion",
                  "wordLimit",
                  e.target.value
                )
              }
            />
          </div>
        )}

        {question.type === "plan_map_diagram_labelling" && (
          <div>
            <label>URL sơ đồ:</label>
            <input
              value={question.planMapDiagramLabelling?.diagramUrl || ""}
              onChange={(e) =>
                handleNestedChange(
                  "planMapDiagramLabelling",
                  "diagramUrl",
                  e.target.value
                )
              }
            />
            <br />
            <label>Nhãn:</label>
            {question.planMapDiagramLabelling?.labels?.map((label, i) => (
              <input
                key={i}
                value={label || ""}
                placeholder={`Nhãn ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange(
                    "planMapDiagramLabelling",
                    "labels",
                    i,
                    e.target.value
                  )
                }
              />
            ))}
            <button
              type="button"
              onClick={() => addToArray("planMapDiagramLabelling", "labels")}>
              +
            </button>
            <br />
            <label>Nhãn đúng:</label>
            {question.planMapDiagramLabelling?.correctLabels?.map(
              (label, i) => (
                <input
                  key={i}
                  value={label || ""}
                  placeholder={`Nhãn đúng ${i + 1}`}
                  onChange={(e) =>
                    handleArrayChange(
                      "planMapDiagramLabelling",
                      "correctLabels",
                      i,
                      e.target.value
                    )
                  }
                />
              )
            )}
            <button
              type="button"
              onClick={() =>
                addToArray("planMapDiagramLabelling", "correctLabels")
              }>
              +
            </button>
            <br />
          </div>
        )}

        {question.type === "sentence_completion" && (
          <div>
            <label>Câu có chỗ trống:</label>
            <input
              value={question.sentenceCompletion?.sentenceWithBlank || ""}
              onChange={(e) =>
                handleNestedChange(
                  "sentenceCompletion",
                  "sentenceWithBlank",
                  e.target.value
                )
              }
            />
            <br />
            <label>Đáp án:</label>
            <input
              value={question.sentenceCompletion?.answer || ""}
              onChange={(e) =>
                handleNestedChange(
                  "sentenceCompletion",
                  "answer",
                  e.target.value
                )
              }
            />
            <br />
            <label>Giới hạn từ:</label>
            <input
              value={question.sentenceCompletion?.wordLimit || ""}
              onChange={(e) =>
                handleNestedChange(
                  "sentenceCompletion",
                  "wordLimit",
                  e.target.value
                )
              }
            />
          </div>
        )}

        <br />
        <button type="submit">Lưu</button>
      </form>
    </div>
  );
}
