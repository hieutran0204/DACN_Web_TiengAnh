import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdminCheck } from "../../utils/auth";

const backendUrl = "http://localhost:3000";

export default function ExamEdit() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
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
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useAdminCheck();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Fetching exam with id:", id);
    if (!id || id === "exams") {
      setError("ID không hợp lệ!");
      navigate("/exams");
      return;
    }
    axios
      .get(`${backendUrl}/api/exams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Full response:", res.data);
        if (res.data.success && res.data.data) {
          setForm(res.data.data);
          setError(null);
        } else {
          setError("Không tìm thấy dữ liệu đề thi!");
        }
      })
      .catch((err) => {
        console.error("API error:", err.response?.data || err.message);
        setError("Lỗi: " + (err.response?.data?.message || err.message));
      });

    // Fetch questions for each skill
    ["listening", "reading", "speaking", "writing"].forEach((skill) => {
      fetchQuestions(skill, page[skill], token);
    });
  }, [id, navigate, page]);

  const fetchQuestions = async (skill, pageNum, token) => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/questions/paginated?skill=${skill}&page=${pageNum}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`Questions for ${skill} received:`, res.data.data);
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
      console.error(`Error fetching ${skill} questions:`, err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCheckbox = (skill, qId) => {
    setForm((prev) => {
      const currentSkills = prev.skills[skill] || [];
      const updatedSkills = currentSkills.includes(qId)
        ? currentSkills.filter((id) => id !== qId)
        : [...currentSkills, qId];
      return { ...prev, skills: { ...prev.skills, [skill]: updatedSkills } };
    });
  };

  const handlePageChange = (skill, newPage) => {
    setPage((prev) => ({ ...prev, [skill]: newPage }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    console.log("Submitting update for id:", id);
    console.log("Form data:", form);
    if (!form) {
      alert("Dữ liệu form không hợp lệ!");
      return;
    }
    try {
      await axios.put(`${backendUrl}/api/exams/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Cập nhật thành công!");
      navigate("/exams");
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      alert("❌ Lỗi cập nhật: " + (err.response?.data?.message || err.message));
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!form) return <p>Đang tải...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>✏️ Chỉnh sửa đề thi</h2>
      <form onSubmit={handleSubmit}>
        <label>Tiêu đề:</label>
        <input
          name="title"
          value={form.title || ""}
          onChange={handleChange}
          required
        />
        <br />
        <label>Mô tả:</label>
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
        />
        <br />
        <label>Thời lượng (phút):</label>
        <input
          type="number"
          name="durationMinutes"
          value={form.durationMinutes || 60}
          onChange={handleChange}
        />
        <br />

        <h3>🧠 Chọn câu hỏi cho từng kỹ năng</h3>
        {["listening", "reading", "speaking", "writing"].map((skill) => {
          const parts = questions[skill] || {};
          return (
            <div key={skill} style={{ marginBottom: 30 }}>
              <h3>📘 {skill.toUpperCase()}</h3>
              {Object.entries(parts).map(([partName, qs]) => (
                <div key={partName} style={{ marginLeft: 20 }}>
                  <h4>🫩 {partName}</h4>
                  <ul>
                    {qs.map((q) => (
                      <li key={q._id}>
                        <label>
                          <input
                            type="checkbox"
                            checked={(form.skills?.[skill] || []).includes(
                              q._id
                            )}
                            onChange={() => toggleCheckbox(skill, q._id)}
                          />
                          {q.content || q.question || "Câu hỏi không rõ"}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div style={{ marginTop: 10 }}>
                <button
                  disabled={page[skill] <= 1}
                  onClick={() => handlePageChange(skill, page[skill] - 1)}>
                  Trang trước
                </button>
                <span>
                  {" "}
                  Trang {page[skill]} / {totalPages[skill]}{" "}
                </span>
                <button
                  disabled={page[skill] >= totalPages[skill]}
                  onClick={() => handlePageChange(skill, page[skill] + 1)}>
                  Trang sau
                </button>
              </div>
            </div>
          );
        })}

        <button type="submit">Lưu</button>
      </form>
    </div>
  );
}
