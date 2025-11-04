import { useState, useEffect } from "react";
import axios from "axios";
import { useAdminCheck } from "../../utils/auth";

export default function CreateListeningQuestion() {
  const [skills, setSkills] = useState([]);
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  useAdminCheck(); // Kiểm tra admin

  const [form, setForm] = useState({
    skill: "",
    part: "",
    type: "multiple_choice",
    content: "",
    difficulty: "easy",
    audio: null,
    image: null,
    question: "",
    options: ["", "", "", ""],
    answer: "",
    instruction: "",
    blanks: [""],
    answers: [""],
    wordLimit: "",
    items: [""],
    matches: [""],
    diagramUrl: "",
    labels: [""],
    correctLabels: [""],
    sentenceWithBlank: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:3000/api/skills", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSkills(res.data.data))
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
          alert("Lỗi lấy skill: " + (err.response?.data?.error || err.message));
        }
      });

    axios
      .get("http://localhost:3000/api/parts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setParts(res.data.data))
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
          alert("Lỗi lấy part: " + (err.response?.data?.error || err.message));
        }
      });
  }, []);

  useEffect(() => {
    const filtered = parts.filter(
      (p) => p.skill === form.skill || p.skill?._id === form.skill
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

    // Debug dữ liệu gửi đi
    console.log("Form data:", {
      ...form,
      audio: form.audio?.name,
      image: form.image?.name,
    });

    // Gắn các trường chung
    data.append("skill", form.skill);
    data.append("part", form.part);
    data.append("type", form.type);
    data.append("difficulty", form.difficulty);
    data.append("content", form.content);
    if (form.audio) data.append("audio", form.audio);
    if (form.image) data.append("image", form.image);

    // Tùy loại câu hỏi
    if (form.type === "multiple_choice") {
      data.append("multipleChoice.question", form.question);
      form.options.forEach((opt, i) =>
        data.append(`multipleChoice.options[${i}]`, opt)
      );
      data.append("multipleChoice.answer", form.answer);
    }

    if (form.type === "short_answer") {
      data.append("shortAnswer.question", form.question);
      data.append("shortAnswer.answer", form.answer);
    }

    if (form.type === "matching") {
      data.append("matching.question", form.question);
      form.items.forEach((val, i) => data.append(`matching.items[${i}]`, val));
      form.options.forEach((val, i) =>
        data.append(`matching.options[${i}]`, val)
      );
      form.matches.forEach((val, i) =>
        data.append(`matching.correctMatches[${i}]`, val)
      );
    }

    if (form.type === "form_note_table_completion") {
      data.append("formNoteTableCompletion.instruction", form.instruction);
      form.blanks.forEach((val, i) =>
        data.append(`formNoteTableCompletion.blanks[${i}]`, val)
      );
      form.answers.forEach((val, i) =>
        data.append(`formNoteTableCompletion.answers[${i}]`, val)
      );
      data.append("formNoteTableCompletion.wordLimit", form.wordLimit);
    }

    if (form.type === "plan_map_diagram_labelling") {
      data.append("planMapDiagramLabelling.diagramUrl", form.diagramUrl);
      form.labels.forEach((val, i) =>
        data.append(`planMapDiagramLabelling.labels[${i}]`, val)
      );
      form.correctLabels.forEach((val, i) =>
        data.append(`planMapDiagramLabelling.correctLabels[${i}]`, val)
      );
    }

    if (form.type === "sentence_completion") {
      data.append(
        "sentenceCompletion.sentenceWithBlank",
        form.sentenceWithBlank
      );
      data.append("sentenceCompletion.answer", form.answer);
      data.append("sentenceCompletion.wordLimit", form.wordLimit);
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/listening-questions",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response:", response.data);
      alert("✅ Tạo câu hỏi thành công!");
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
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
          "❌ Lỗi gửi câu hỏi: " + (err.response?.data?.error || err.message)
        );
      }
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>Tạo câu hỏi Listening</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>Skill:</label>
        <select
          name="skill"
          value={form.skill}
          onChange={handleChange}
          required>
          <option value="">-- Chọn kỹ năng --</option>
          {skills.map((skill) => (
            <option key={skill._id} value={skill._id}>
              {skill.name}
            </option>
          ))}
        </select>
        <br />

        <label>Part:</label>
        <select name="part" value={form.part} onChange={handleChange} required>
          <option value="">-- Chọn part --</option>
          {filteredParts.map((part) => (
            <option key={part._id} value={part._id}>
              {part.name}
            </option>
          ))}
        </select>
        <br />

        <label>Loại câu hỏi:</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="multiple_choice">Multiple Choice</option>
          <option value="short_answer">Short Answer</option>
          <option value="matching">Matching</option>
          <option value="form_note_table_completion">
            Form/Note Completion
          </option>
          <option value="plan_map_diagram_labelling">
            Map/Diagram Labelling
          </option>
          <option value="sentence_completion">Sentence Completion</option>
        </select>
        <br />

        <label>Nội dung chung:</label>
        <input
          type="text"
          name="content"
          value={form.content}
          onChange={handleChange}
        />
        <br />

        <label>Độ khó:</label>
        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}>
          <option value="easy">Dễ</option>
          <option value="medium">Trung bình</option>
          <option value="hard">Khó</option>
        </select>
        <br />

        {form.type === "multiple_choice" && (
          <div>
            <label>Câu hỏi:</label>
            <input
              type="text"
              name="question"
              value={form.question}
              onChange={handleChange}
            />
            <br />
            <label>Options:</label>
            <br />
            {form.options.map((opt, i) => (
              <input
                key={i}
                value={opt}
                placeholder={`Option ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange("options", i, e.target.value)
                }
              />
            ))}
            <br />
            <label>Đáp án:</label>
            <input name="answer" value={form.answer} onChange={handleChange} />
          </div>
        )}

        {form.type === "short_answer" && (
          <div>
            <label>Câu hỏi:</label>
            <input
              name="question"
              value={form.question}
              onChange={handleChange}
            />
            <br />
            <label>Đáp án:</label>
            <input name="answer" value={form.answer} onChange={handleChange} />
          </div>
        )}

        {form.type === "matching" && (
          <div>
            <label>Câu hỏi:</label>
            <input
              name="question"
              value={form.question}
              onChange={handleChange}
            />
            <br />
            <label>Items:</label>
            {form.items.map((item, i) => (
              <input
                key={i}
                value={item}
                placeholder={`Item ${i + 1}`}
                onChange={(e) => handleArrayChange("items", i, e.target.value)}
              />
            ))}
            <button type="button" onClick={() => addToArray("items")}>
              +
            </button>
            <br />
            <label>Options:</label>
            {form.options.map((opt, i) => (
              <input
                key={i}
                value={opt}
                placeholder={`Option ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange("options", i, e.target.value)
                }
              />
            ))}
            <button type="button" onClick={() => addToArray("options")}>
              +
            </button>
            <br />
            <label>Matches:</label>
            {form.matches.map((m, i) => (
              <input
                key={i}
                value={m}
                placeholder={`Match ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange("matches", i, e.target.value)
                }
              />
            ))}
            <button type="button" onClick={() => addToArray("matches")}>
              +
            </button>
            <br />
          </div>
        )}

        {form.type === "form_note_table_completion" && (
          <div>
            <label>Instruction:</label>
            <input
              name="instruction"
              value={form.instruction}
              onChange={handleChange}
            />
            <br />
            <label>Blanks:</label>
            {form.blanks.map((b, i) => (
              <input
                key={i}
                value={b}
                placeholder={`Blank ${i + 1}`}
                onChange={(e) => handleArrayChange("blanks", i, e.target.value)}
              />
            ))}
            <button type="button" onClick={() => addToArray("blanks")}>
              +
            </button>
            <br />
            <label>Answers:</label>
            {form.answers.map((a, i) => (
              <input
                key={i}
                value={a}
                placeholder={`Answer ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange("answers", i, e.target.value)
                }
              />
            ))}
            <button type="button" onClick={() => addToArray("answers")}>
              +
            </button>
            <br />
            <label>Word Limit:</label>
            <input
              name="wordLimit"
              value={form.wordLimit}
              onChange={handleChange}
            />
          </div>
        )}

        {form.type === "plan_map_diagram_labelling" && (
          <div>
            <label>Diagram URL:</label>
            <input
              name="diagramUrl"
              value={form.diagramUrl}
              onChange={handleChange}
            />
            <br />
            <label>Labels:</label>
            {form.labels.map((l, i) => (
              <input
                key={i}
                value={l}
                placeholder={`Label ${i + 1}`}
                onChange={(e) => handleArrayChange("labels", i, e.target.value)}
              />
            ))}
            <button type="button" onClick={() => addToArray("labels")}>
              +
            </button>
            <br />
            <label>Correct Labels:</label>
            {form.correctLabels.map((c, i) => (
              <input
                key={i}
                value={c}
                placeholder={`Correct Label ${i + 1}`}
                onChange={(e) =>
                  handleArrayChange("correctLabels", i, e.target.value)
                }
              />
            ))}
            <button type="button" onClick={() => addToArray("correctLabels")}>
              +
            </button>
            <br />
          </div>
        )}

        {form.type === "sentence_completion" && (
          <div>
            <label>Sentence with Blank:</label>
            <input
              name="sentenceWithBlank"
              value={form.sentenceWithBlank}
              onChange={handleChange}
            />
            <br />
            <label>Answer:</label>
            <input name="answer" value={form.answer} onChange={handleChange} />
            <br />
            <label>Word Limit:</label>
            <input
              name="wordLimit"
              value={form.wordLimit}
              onChange={handleChange}
            />
          </div>
        )}

        <label>Audio:</label>
        <input
          type="file"
          name="audio"
          accept="audio/*"
          onChange={handleChange}
        />
        <br />
        <label>Hình ảnh:</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />
        <br />

        <button type="submit">Gửi câu hỏi</button>
      </form>
    </div>
  );
}
