// // src/pages/Listening/Detail.jsx
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// export default function ListeningDetail() {
//   const { id } = useParams();
//   const [question, setQuestion] = useState(null);

//   useEffect(() => {
//     axios
//       .get(`http://localhost:3000/api/listening-questions/${id}`)
//       .then((res) => setQuestion(res.data.data))
//       .catch((err) => alert("Lỗi lấy chi tiết: " + err.message));
//   }, [id]);

//   if (!question) return <p>Đang tải...</p>;

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Chi tiết câu hỏi</h2>
//       <p>
//         <b>ID:</b> {question._id}
//       </p>
//       <p>
//         <b>Loại:</b> {question.type}
//       </p>
//       <p>
//         <b>Part:</b> {question.part?.name || question.part}
//       </p>
//       <p>
//         <b>Nội dung:</b> {question.content}
//       </p>
//       <p>
//         <b>Độ khó:</b> {question.difficulty}
//       </p>

//       {question.audio && (
//         <>
//           <p>
//             <b>Audio:</b>
//           </p>
//           <audio controls src={`http://localhost:3000${question.audio}`} />
//         </>
//       )}

//       {question.image && (
//         <>
//           <p>
//             <b>Hình ảnh:</b>
//           </p>
//           <img
//             src={`http://localhost:3000${question.image}`}
//             alt="Question"
//             style={{ width: 200 }}
//           />
//         </>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAdminCheck } from "../../utils/auth";

export default function ListeningDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  useAdminCheck(); // Kiểm tra admin

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://localhost:3000/api/listening-questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setQuestion(res.data.data))
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

  if (!question) return <p>Đang tải...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Chi tiết câu hỏi</h2>
      <p>
        <b>ID:</b> {question._id}
      </p>
      <p>
        <b>Loại:</b> {question.type}
      </p>
      <p>
        <b>Part:</b> {question.part?.name || question.part}
      </p>
      <p>
        <b>Nội dung:</b> {question.content}
      </p>
      <p>
        <b>Độ khó:</b> {question.difficulty}
      </p>

      {question.audio && (
        <>
          <p>
            <b>Audio:</b>
          </p>
          <audio controls src={`http://localhost:3000${question.audio}`} />
        </>
      )}

      {question.image && (
        <>
          <p>
            <b>Hình ảnh:</b>
          </p>
          <img
            src={`http://localhost:3000${question.image}`}
            alt="Question"
            style={{ width: 200 }}
          />
        </>
      )}
    </div>
  );
}
