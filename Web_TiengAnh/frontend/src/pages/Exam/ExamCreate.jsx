import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAdminCheck } from "../../utils/auth";

const backendUrl = "http://localhost:3000";

export default function ExamCreate() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    durationMinutes: 60,
  });
  const [skills, setSkills] = useState({
    listening: [],
    reading: [],
    speaking: [],
    writing: [],
  });
  const [questions, setQuestions] = useState({
    listening: {},
    reading: {},
    speaking: {},
    writing: {},
  });
  const [page, setPage] = useState({
    listening: 1,
    reading: 1,
    speaking: 1,
    writing: 1,
  });
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState({
    listening: 1,
    reading: 1,
    speaking: 1,
    writing: 1,
  });
  const navigate = useNavigate();
  useAdminCheck();

  const fetchQuestions = async (skill, pageNum) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `${backendUrl}/api/questions/paginated?skill=${skill}&page=${pageNum}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions((prev) => ({
        ...prev,
        [skill]: res.data.data.reduce((acc, q) => {
          const partName = q.part?.name || "Unknown Part";
          acc[partName] = acc[partName] || [];
          acc[partName].push(q);
          return acc;
        }, {}),
      }));
      setTotalPages((prev) => ({
        ...prev,
        [skill]: res.data.totalPages,
      }));
    } catch (err) {
      alert(`Lỗi lấy câu hỏi ${skill}: ${err.message}`);
    }
  };

  useEffect(() => {
    ["listening", "reading", "speaking", "writing"].forEach((skill) => {
      fetchQuestions(skill, page[skill]);
    });
  }, [page]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCheckbox = (skill, id) => {
    setSkills((prev) => {
      const set = new Set(prev[skill]);
      set.has(id) ? set.delete(id) : set.add(id);
      return { ...prev, [skill]: Array.from(set) };
    });
  };

  const getQuestionLabel = (q, skillName) => {
    switch (skillName) {
      case "listening":
        return (
          q.multipleChoice?.question ||
          q.shortAnswer?.question ||
          q.sentenceCompletion?.sentenceWithBlank ||
          q.matching?.question ||
          q.formNoteTableCompletion?.instruction ||
          q.content ||
          "Câu hỏi không rõ"
        );
      case "reading":
        return (
          q.content ||
          q.sentenceCompletion?.sentenceWithBlank ||
          q.trueFalseNotGiven?.statement ||
          q.yesNoNotGiven?.statement ||
          q.summaryCompletion?.summaryText ||
          "Câu hỏi không rõ"
        );
      case "speaking":
      case "writing":
        return q.question || q.topic || "Câu hỏi không rõ";
      default:
        return "Câu hỏi không rõ";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = `${backendUrl}/api/exams`;
    console.log("Gửi yêu cầu đến:", url);
    console.log("Dữ liệu gửi đi:", { ...form, skills });

    try {
      const response = await axios.post(
        url,
        { ...form, skills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Phản hồi từ server:", response.data);
      alert("\u2705 Tạo đề thành công!");
      navigate("/exams"); // Điều hướng đúng, tránh URL sai
      console.log("Điều hướng đến:", "/exams");
    } catch (err) {
      console.error("Lỗi chi tiết:", err.response?.data || err.message);
      alert(
        "\u274C Lỗi tạo đề: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handlePageChange = (skill, newPage) => {
    setPage((prev) => ({ ...prev, [skill]: newPage }));
  };

  const renderSkill = (skillName) => {
    const parts = questions[skillName];
    if (!parts) return null;

    return (
      <div key={skillName} style={{ marginBottom: 30 }}>
        <h3>📘 {skillName.toUpperCase()}</h3>
        {Object.entries(parts).map(([partName, qs]) => (
          <div key={partName} style={{ marginLeft: 20 }}>
            <h4>🫩 {partName}</h4>
            <ul>
              {qs.map((q) => (
                <li key={q._id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={skills[skillName].includes(q._id)}
                      onChange={() => toggleCheckbox(skillName, q._id)}
                    />
                    {getQuestionLabel(q, skillName)}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div style={{ marginTop: 10 }}>
          <button
            disabled={page[skillName] <= 1}
            onClick={() => handlePageChange(skillName, page[skillName] - 1)}>
            Trang trước
          </button>
          <span>
            {" "}
            Trang {page[skillName]} / {totalPages[skillName]}{" "}
          </span>
          <button
            disabled={page[skillName] >= totalPages[skillName]}
            onClick={() => handlePageChange(skillName, page[skillName] + 1)}>
            Trang sau
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>➕ Tạo đề thi mới</h2>
      <form onSubmit={handleSubmit}>
        <label>Tiêu đề:</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <br />
        <label>Mô tả:</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
        />
        <br />
        <label>Thời lượng (phút):</label>
        <input
          type="number"
          name="durationMinutes"
          value={form.durationMinutes}
          onChange={handleChange}
        />
        <br />

        <h3>🧠 Chọn câu hỏi cho từng kỹ năng</h3>
        {["listening", "reading", "speaking", "writing"].map(renderSkill)}

        <button type="submit" style={{ marginTop: 20 }}>
          Tạo đề
        </button>
      </form>
    </div>
  );
}
