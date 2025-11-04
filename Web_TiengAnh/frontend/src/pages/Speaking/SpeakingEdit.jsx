import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdminCheck } from "../../utils/auth";

export default function EditSpeakingQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [image, setImage] = useState(null);
  const [parts, setParts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);

  useAdminCheck();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Không tìm thấy token. Vui lòng đăng nhập lại.");
      window.location.href = "/login";
      return;
    }

    Promise.all([
      axios.get(`http://localhost:3000/api/speaking-questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("http://localhost:3000/api/parts", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("http://localhost:3000/api/skills", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([questionRes, partsRes, skillsRes]) => {
        setQuestion(questionRes.data.data);
        setParts(partsRes.data.data || []);
        setSkills(skillsRes.data.data || []);
      })
      .catch((err) => {
        alert("Lỗi tải dữ liệu: " + (err.response?.data?.error || err.message));
        navigate("/speaking");
      });
  }, [id, navigate]);

  useEffect(() => {
    if (question && question.skill && parts.length > 0) {
      const filtered = parts.filter(
        (part) => part.skill.toString() === question.skill
      );
      setFilteredParts(filtered);
    } else {
      setFilteredParts(parts);
    }
  }, [question, parts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestion((prev) => {
      const newQuestion = { ...prev, [name]: value };
      if (name === "skill" && parts.length > 0) {
        const filtered = parts.filter(
          (part) => part.skill.toString() === value
        );
        setFilteredParts(filtered.length > 0 ? filtered : parts);
      }
      return newQuestion;
    });
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...(question[field] || [])];
    updated[index] = value;
    setQuestion((prev) => ({ ...prev, [field]: updated }));
  };

  const addToArray = (field) => {
    setQuestion((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();

    if (
      !question.skill ||
      !question.part ||
      !question.topic ||
      !question.type ||
      !question.question
    ) {
      alert(
        "Thiếu thông tin bắt buộc: skill, part, topic, type hoặc question."
      );
      return;
    }

    formData.append("skill", question.skill || "");
    formData.append("part", question.part || "");
    formData.append("topic", question.topic || "");
    formData.append("type", question.type);
    formData.append("question", question.question);
    formData.append("sampleAnswer", question.sampleAnswer || "");
    formData.append("difficulty", question.difficulty || "medium");
    formData.append("content", question.content || "");
    formData.append("passage", question.passage || "");

    if (image) {
      formData.append("image", image);
    } else if (question.image && typeof question.image === "string") {
      formData.append("image", question.image);
    }

    (question.subQuestions || []).forEach((q, i) =>
      formData.append(`subQuestions[${i}]`, q || "")
    );

    (question.suggestedIdeas || []).forEach((idea, i) =>
      formData.append(`suggestedIdeas[${i}]`, idea || "")
    );

    try {
      await axios.put(
        `http://localhost:3000/api/speaking-questions/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("✅ Cập nhật thành công!");
      navigate("/speaking");
    } catch (err) {
      alert("❌ Lỗi cập nhật: " + (err.response?.data?.error || err.message));
    }
  };

  if (!question) return <div className="p-6 text-gray-600">Đang tải...</div>;

  const questionTypeLabels = {
    personal_experience: "Personal Experience",
    descriptive: "Descriptive",
    comparative: "Comparative",
    opinion_based: "Opinion Based",
    cause_effect: "Cause and Effect",
    hypothetical: "Hypothetical",
    advantage_disadvantage: "Advantage/Disadvantage",
    problem_solution: "Problem/Solution",
    prediction: "Prediction",
    abstract: "Abstract",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Chỉnh sửa câu hỏi Speaking
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Kỹ năng</label>
          <select
            name="skill"
            value={question.skill || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required>
            <option value="">-- Chọn kỹ năng --</option>
            {skills.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block">Phần</label>
          <select
            name="part"
            value={question.part || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required>
            <option value="">-- Chọn phần --</option>
            {filteredParts.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block">Chủ đề</label>
          <input
            name="topic"
            value={question.topic || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block">Loại câu hỏi</label>
          <select
            name="type"
            value={question.type || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required>
            <option value="">-- Chọn loại --</option>
            {Object.entries(questionTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block">Câu hỏi</label>
          <input
            name="question"
            value={question.question || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block">Đáp án mẫu</label>
          <textarea
            name="sampleAnswer"
            value={question.sampleAnswer || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block">Hình ảnh</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {question.image && (
            <img
              src={question.image}
              alt="Hình hiện tại"
              className="mt-2 max-w-xs rounded"
            />
          )}
        </div>

        <div>
          <label className="block">Độ khó</label>
          <select
            name="difficulty"
            value={question.difficulty || "medium"}
            onChange={handleChange}
            className="w-full border p-2 rounded">
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
        </div>
        {/* 
        <div>
          <label className="block">Nội dung mô tả</label>
          <textarea
            name="content"
            value={question.content || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div> */}

        <div>
          <label className="block">Ngữ cảnh</label>
          <textarea
            name="passage"
            value={question.passage || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block">Câu hỏi phụ</label>
          {(question.subQuestions || []).map((q, i) => (
            <input
              key={i}
              value={q || ""}
              onChange={(e) =>
                handleArrayChange("subQuestions", i, e.target.value)
              }
              className="w-full border p-2 rounded mb-2"
            />
          ))}
          <button
            type="button"
            onClick={() => addToArray("subQuestions")}
            className="text-blue-600 hover:underline">
            + Thêm câu hỏi phụ
          </button>
        </div>

        <div>
          <label className="block">Ý tưởng gợi ý</label>
          {(question.suggestedIdeas || []).map((q, i) => (
            <input
              key={i}
              value={q || ""}
              onChange={(e) =>
                handleArrayChange("suggestedIdeas", i, e.target.value)
              }
              className="w-full border p-2 rounded mb-2"
            />
          ))}
          <button
            type="button"
            onClick={() => addToArray("suggestedIdeas")}
            className="text-blue-600 hover:underline">
            + Thêm ý tưởng
          </button>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Cập nhật câu hỏi
          </button>
          <button
            type="button"
            onClick={() => navigate("/speaking")}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
