import { useState, useEffect } from "react";
import axios from "axios";
import { useAdminCheck } from "../../utils/auth";

export default function CreateWritingQuestion() {
  const [skills, setSkills] = useState([]);
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  useAdminCheck();

  const [form, setForm] = useState({
    skill: "",
    part: "",
    task: "Task 1",
    type: "bar_chart",
    topic: "",
    difficulty: "easy",
    image: null,
    question: "",
    suggestedIdeas: [""],
    sampleAnswer: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Không tìm thấy token. Vui lòng đăng nhập lại.");
      window.location.href = "/login";
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get("http://localhost:3000/api/skills", { headers })
      .then((res) => setSkills(res.data.data || []))
      .catch((err) => handleAuthError(err));

    axios
      .get("http://localhost:3000/api/parts", { headers })
      .then((res) => setParts(res.data.data || []))
      .catch((err) => handleAuthError(err));
  }, []);

  const handleAuthError = (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      alert(
        "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
      );
      localStorage.clear();
      window.location.href = "/login";
    } else {
      alert("Lỗi: " + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    const filtered = parts.filter(
      (p) =>
        form.skill && (p.skill === form.skill || p.skill?._id === form.skill)
    );
    setFilteredParts(filtered);
    setForm((prev) => ({ ...prev, part: "" }));
  }, [form.skill, parts]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm((prev) => ({ ...prev, [field]: updated }));
  };

  const addToArray = (field) => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    const token = localStorage.getItem("token");

    if (!form.skill || !form.part || !form.topic || !form.question) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    data.append("skill", form.skill);
    data.append("part", form.part);
    data.append("task", form.task);
    data.append("type", form.type);
    data.append("topic", form.topic);
    data.append("question", form.question);
    data.append("sampleAnswer", form.sampleAnswer);
    data.append("difficulty", form.difficulty);
    if (form.image) data.append("image", form.image);
    form.suggestedIdeas.forEach((idea, i) =>
      data.append(`suggestedIdeas[${i}]`, idea)
    );

    try {
      await axios.post("http://localhost:3000/api/writing-questions", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✅ Tạo câu hỏi thành công!");
      setForm({
        skill: "",
        part: "",
        task: "Task 1",
        type: "bar_chart",
        topic: "",
        difficulty: "easy",
        image: null,
        question: "",
        suggestedIdeas: [""],
        sampleAnswer: "",
      });
    } catch (err) {
      handleAuthError(err);
    }
  };

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 800,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 8,
      }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: 15 }}>
        Tạo câu hỏi Writing
      </h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label style={labelStyle}>Kỹ năng:</label>
        <select
          name="skill"
          value={form.skill}
          onChange={handleChange}
          required
          style={selectStyle}>
          <option value="">-- Chọn kỹ năng --</option>
          {skills.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <label style={labelStyle}>Phần:</label>
        <select
          name="part"
          value={form.part}
          onChange={handleChange}
          required
          style={selectStyle}>
          <option value="">-- Chọn phần --</option>
          {filteredParts.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <label style={labelStyle}>Task:</label>
        <select
          name="task"
          value={form.task}
          onChange={handleChange}
          style={selectStyle}>
          <option value="Task 1">Task 1</option>
          <option value="Task 2">Task 2</option>
        </select>

        <label style={labelStyle}>Loại câu hỏi:</label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          style={selectStyle}>
          {[
            "bar_chart",
            "line_graph",
            "pie_chart",
            "table",
            "process",
            "map",
            "mixed_chart",
            "formal_letter",
            "semi_formal_letter",
            "informal_letter",
            "opinion",
            "discussion",
            "problem_solution",
            "cause_effect",
            "advantage_disadvantage",
          ].map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <label style={labelStyle}>Độ khó:</label>
        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
          style={selectStyle}>
          <option value="easy">Dễ</option>
          <option value="medium">Trung bình</option>
          <option value="hard">Khó</option>
        </select>

        <label style={labelStyle}>Chủ đề (tự nhập):</label>
        <input
          type="text"
          name="topic"
          value={form.topic}
          onChange={handleChange}
          required
          style={inputStyle}
          placeholder="Nhập chủ đề tùy ý"
        />

        <label style={labelStyle}>Câu hỏi:</label>
        <input
          type="text"
          name="question"
          value={form.question}
          onChange={handleChange}
          required
          style={inputStyle}
          placeholder="Nhập câu hỏi chính"
        />

        <label style={labelStyle}>Đáp án mẫu:</label>
        <textarea
          name="sampleAnswer"
          value={form.sampleAnswer}
          onChange={handleChange}
          style={textareaStyle}
        />

        <label style={labelStyle}>Ý tưởng gợi ý:</label>
        {form.suggestedIdeas.map((idea, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <input
              type="text"
              value={idea}
              onChange={(e) =>
                handleArrayChange("suggestedIdeas", i, e.target.value)
              }
              placeholder={`Ý tưởng ${i + 1}`}
              style={inputStyle}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => addToArray("suggestedIdeas")}
          style={buttonAddStyle}>
          + Thêm ý tưởng
        </button>

        <label style={labelStyle}>Hình ảnh (tùy chọn):</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          style={{ marginBottom: 15 }}
        />

        <button type="submit" style={submitStyle}>
          Gửi câu hỏi
        </button>
      </form>
    </div>
  );
}

const labelStyle = { display: "block", marginBottom: 5 };
const selectStyle = {
  width: "100%",
  padding: 8,
  marginBottom: 15,
  border: "1px solid #ddd",
  borderRadius: 4,
};
const inputStyle = {
  ...selectStyle,
  marginBottom: 15,
};
const textareaStyle = {
  ...inputStyle,
  minHeight: 80,
};
const buttonAddStyle = {
  color: "blue",
  marginBottom: 15,
  background: "none",
  border: "none",
  cursor: "pointer",
};
const submitStyle = {
  background: "#007bff",
  color: "#fff",
  padding: "10px 20px",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};
