// // import { useState, useEffect } from "react";
// // import { Link } from "react-router-dom";
// // import axios from "axios";
// // import { useAdminCheck } from "../../utils/auth";

// // export default function ReadingList() {
// //   const [questions, setQuestions] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   useAdminCheck();

// //   useEffect(() => {
// //     const token = localStorage.getItem("token");
// //     if (!token) {
// //       alert("Không tìm thấy token. Vui lòng đăng nhập lại.");
// //       window.location.href = "/login";
// //       return;
// //     }

// //     setLoading(true);
// //     axios
// //       .get("http://localhost:3000/api/reading-questions", {
// //         headers: { Authorization: `Bearer ${token}` },
// //       })
// //       .then((res) => {
// //         setQuestions(res.data.data || []);
// //       })
// //       .catch((err) => {
// //         if (err.response?.status === 401 || err.response?.status === 403) {
// //           alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
// //           localStorage.removeItem("token");
// //           localStorage.removeItem("roleId");
// //           localStorage.removeItem("role");
// //           window.location.href = "/login";
// //         } else {
// //           setError(
// //             "Không thể tải danh sách câu hỏi: " +
// //               (err.response?.data?.message || err.message)
// //           );
// //         }
// //       })
// //       .finally(() => setLoading(false));
// //   }, []);

// //   const handleDelete = async (id) => {
// //     if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;

// //     const token = localStorage.getItem("token");
// //     try {
// //       await axios.delete(`http://localhost:3000/api/reading-questions/${id}`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       setQuestions(questions.filter((q) => q._id !== id));
// //       alert("✅ Xóa câu hỏi thành công!");
// //     } catch (err) {
// //       if (err.response?.status === 401 || err.response?.status === 403) {
// //         alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
// //         localStorage.removeItem("token");
// //         localStorage.removeItem("roleId");
// //         localStorage.removeItem("role");
// //         window.location.href = "/login";
// //       } else {
// //         alert(
// //           "❌ Lỗi xóa câu hỏi: " + (err.response?.data?.message || err.message)
// //         );
// //       }
// //     }
// //   };

// //   const handleSearch = (e) => {
// //     setSearchTerm(e.target.value);
// //   };

// //   const filteredQuestions = questions.filter(
// //     (q) =>
// //       q.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //       q.type?.toLowerCase().includes(searchTerm.toLowerCase())
// //   );

// //   if (loading) return <div className="p-6 text-gray-600">Đang tải...</div>;
// //   if (error) return <div className="p-6 text-red-600">Lỗi: {error}</div>;

// //   return (
// //     <div className="p-6 max-w-6xl mx-auto bg-white shadow-md rounded-lg">
// //       <div className="flex justify-between items-center mb-6">
// //         <h2 className="text-2xl font-bold text-gray-800">
// //           Danh sách câu hỏi Reading
// //         </h2>
// //         <Link
// //           to="/reading/create"
// //           className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
// //           Tạo câu hỏi mới
// //         </Link>
// //       </div>

// //       <div className="mb-4">
// //         <input
// //           type="text"
// //           placeholder="Tìm kiếm theo nội dung hoặc loại câu hỏi..."
// //           value={searchTerm}
// //           onChange={handleSearch}
// //           className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
// //         />
// //       </div>

// //       {filteredQuestions.length === 0 ? (
// //         <p className="text-gray-500">Không tìm thấy câu hỏi nào.</p>
// //       ) : (
// //         <div className="overflow-x-auto">
// //           <table className="min-w-full bg-white border border-gray-200">
// //             <thead>
// //               <tr className="bg-gray-100">
// //                 <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">
// //                   Hình ảnh
// //                 </th>
// //                 <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">
// //                   Nội dung
// //                 </th>
// //                 <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">
// //                   Loại
// //                 </th>
// //                 <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">
// //                   Phần
// //                 </th>
// //                 <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">
// //                   Độ khó
// //                 </th>
// //                 <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">
// //                   Hành động
// //                 </th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {filteredQuestions.map((q) => (
// //                 <tr key={q._id} className="hover:bg-gray-50">
// //                   <td className="py-2 px-4 border-b">
// //                     {q.image ? (
// //                       <img
// //                         src={q.image}
// //                         alt="Question Image"
// //                         className="w-16 h-16 object-cover rounded"
// //                       />
// //                     ) : (
// //                       <span className="text-gray-500">Không có</span>
// //                     )}
// //                   </td>
// //                   <td className="py-2 px-4 border-b text-sm text-gray-700">
// //                     {q.content
// //                       ? q.content.substring(0, 50) +
// //                         (q.content.length > 50 ? "..." : "")
// //                       : "Không có nội dung"}
// //                   </td>
// //                   <td className="py-2 px-4 border-b text-sm text-gray-700">
// //                     {q.type || "N/A"}
// //                   </td>
// //                   <td className="py-2 px-4 border-b text-sm text-gray-700">
// //                     {q.part?.name || "N/A"}
// //                   </td>
// //                   <td className="py-2 px-4 border-b text-sm text-gray-700">
// //                     {q.difficult === "easy"
// //                       ? "Dễ"
// //                       : q.difficult === "medium"
// //                         ? "Trung bình"
// //                         : "Khó"}
// //                   </td>
// //                   <td className="py-2 px-4 border-b text-sm">
// //                     <div className="flex space-x-2">
// //                       <Link
// //                         to={`/reading/${q._id}`}
// //                         className="text-blue-600 hover:underline">
// //                         Xem
// //                       </Link>
// //                       <Link
// //                         to={`/reading/edit/${q._id}`}
// //                         className="text-green-600 hover:underline">
// //                         Sửa
// //                       </Link>
// //                       <button
// //                         onClick={() => handleDelete(q._id)}
// //                         className="text-red-600 hover:underline">
// //                         Xóa
// //                       </button>
// //                     </div>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// import { useEffect, useState, useRef } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";
// import $ from "jquery"; // Import jQuery
// import { useAdminCheck } from "../../utils/auth";
// import "datatables.net"; // Import DataTables

// export default function ReadingList() {
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const tableRef = useRef(null);
//   useAdminCheck();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       alert("Không tìm thấy token. Vui lòng đăng nhập lại.");
//       window.location.href = "/login";
//       return;
//     }

//     setLoading(true);
//     axios
//       .get("http://localhost:3000/api/reading-questions", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => {
//         setQuestions(res.data.data || []);
//       })
//       .catch((err) => {
//         if (err.response?.status === 401 || err.response?.status === 403) {
//           alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
//           localStorage.removeItem("token");
//           localStorage.removeItem("roleId");
//           localStorage.removeItem("role");
//           window.location.href = "/login";
//         } else {
//           setError(
//             "Không thể tải danh sách câu hỏi: " +
//               (err.response?.data?.message || err.message)
//           );
//         }
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => {
//     if (tableRef.current && !loading && questions.length > 0) {
//       $(tableRef.current).DataTable({
//         paging: true,
//         ordering: true,
//         searching: true,
//         info: true,
//         pageLength: 10,
//         responsive: true,
//         destroy: true, // Đảm bảo hủy DataTable cũ trước khi khởi tạo mới
//       });
//     }

//     // Cleanup khi component unmount
//     return () => {
//       if (tableRef.current && $.fn.DataTable.isDataTable(tableRef.current)) {
//         $(tableRef.current).DataTable().destroy();
//       }
//     };
//   }, [loading, questions]); // Thêm questions vào dependency array

//   const handleDelete = async (id) => {
//     if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;

//     const token = localStorage.getItem("token");
//     try {
//       await axios.delete(`http://localhost:3000/api/reading-questions/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setQuestions(questions.filter((q) => q._id !== id));
//       alert("✅ Xóa câu hỏi thành công!");
//     } catch (err) {
//       if (err.response?.status === 401 || err.response?.status === 403) {
//         alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
//         localStorage.removeItem("token");
//         localStorage.removeItem("roleId");
//         localStorage.removeItem("role");
//         window.location.href = "/login";
//       } else {
//         alert(
//           "❌ Lỗi xóa câu hỏi: " + (err.response?.data?.message || err.message)
//         );
//       }
//     }
//   };

//   if (loading) return <div className="p-6 text-gray-600">Đang tải...</div>;
//   if (error) return <div className="p-6 text-red-600">Lỗi: {error}</div>;

//   return (
//     <div className="p-6 max-w-6xl mx-auto bg-white shadow-md rounded-lg">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">
//           Danh sách câu hỏi Reading
//         </h2>
//         <Link
//           to="/reading/create"
//           className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
//           Tạo câu hỏi mới
//         </Link>
//       </div>

//       <table ref={tableRef} className="display min-w-full">
//         <thead>
//           <tr>
//             <th>Hình ảnh</th>
//             <th>Nội dung</th>
//             <th>Loại</th>
//             <th>Phần</th>
//             <th>Độ khó</th>
//             <th>Hành động</th>
//           </tr>
//         </thead>
//         <tbody>
//           {questions.map((q) => (
//             <tr key={q._id}>
//               <td>
//                 {q.image ? (
//                   <img
//                     src={q.image}
//                     alt="Question Image"
//                     className="w-16 h-16 object-cover rounded"
//                   />
//                 ) : (
//                   <span className="text-gray-500">Không có</span>
//                 )}
//               </td>
//               <td>
//                 {q.content?.substring(0, 50) +
//                   (q.content?.length > 50 ? "..." : "")}
//               </td>
//               <td>{q.type || "N/A"}</td>
//               <td>{q.part?.name || "N/A"}</td>
//               <td>
//                 {q.difficult === "easy"
//                   ? "Dễ"
//                   : q.difficult === "medium"
//                     ? "Trung bình"
//                     : "Khó"}
//               </td>
//               <td>
//                 <div className="flex space-x-2">
//                   <Link
//                     to={`/reading/${q._id}`}
//                     className="text-blue-600 hover:underline">
//                     Xem
//                   </Link>
//                   <Link
//                     to={`/reading/edit/${q._id}`}
//                     className="text-green-600 hover:underline">
//                     Sửa
//                   </Link>
//                   <button
//                     onClick={() => handleDelete(q._id)}
//                     className="text-red-600 hover:underline">
//                     Xóa
//                   </button>
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import $ from "jquery"; // Import jQuery
import { useAdminCheck, logout } from "../../utils/auth";
import "datatables.net"; // Import DataTables

export default function ReadingList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tableRef = useRef(null);
  useAdminCheck();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    axios
      .get("http://localhost:3000/api/reading-questions", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) {
          setQuestions(res.data.data);
        } else {
          setError("Dữ liệu từ server không hợp lệ hoặc trống.");
        }
      })
      .catch((err) => {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          localStorage.removeItem("roleId");
          localStorage.removeItem("role");
          setTimeout(() => (window.location.href = "/login"), 100);
        } else {
          setError(
            "Lỗi lấy danh sách: " +
              (err.response?.data?.error || err.message || "Kết nối thất bại")
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tableRef.current && !loading && questions.length > 0) {
      $(tableRef.current).DataTable({
        paging: true,
        ordering: true,
        searching: true,
        info: true,
        pageLength: 10,
        responsive: true,
        destroy: true, // Hủy DataTable cũ trước khi khởi tạo mới
      });
    }

    // Cleanup khi component unmount
    return () => {
      if (tableRef.current && $.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
    };
  }, [loading, questions]); // Thêm questions vào dependency array

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) {
      const token = localStorage.getItem("token");
      try {
        await axios.delete(
          `http://localhost:3000/api/reading-questions/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setQuestions(questions.filter((q) => q._id !== id));
        alert("Xóa câu hỏi thành công!");
      } catch (err) {
        alert(
          "Lỗi khi xóa: " +
            (err.response?.data?.error || err.message || "Kết nối thất bại")
        );
      }
    }
  };

  const renderQuestionContent = (q) => {
    switch (q.type) {
      case "multiple_choice":
        return q.multipleChoice?.question || "-";
      case "true_false_not_given":
      case "yes_no_not_given":
        return q[q.type]?.statement || "-";
      case "matching_headings":
        return q.matchingHeadings?.paragraph || "-";
      case "matching_information":
        return q.matchingInformation?.infoText || "-";
      case "matching_features":
        return q.matchingFeatures?.item || "-";
      case "matching_sentence_endings":
        return q.matchingSentenceEndings?.start || "-";
      case "sentence_completion":
        return q.sentenceCompletion?.sentenceWithBlank || "-";
      case "summary_completion":
        return q.summaryCompletion?.summaryText || "-";
      case "diagram_label_completion":
        return q.diagramLabelCompletion?.diagramUrl || "-";
      default:
        return q.content || "-";
    }
  };

  const renderAnswer = (q) => {
    switch (q.type) {
      case "multiple_choice":
        return q.multipleChoice?.answer || "-";
      case "true_false_not_given":
      case "yes_no_not_given":
        return q[q.type]?.answer || "-";
      case "matching_headings":
        return q.matchingHeadings?.correctHeading || "-";
      case "matching_information":
        return q.matchingInformation?.paragraphLabel || "-";
      case "matching_features":
        return q.matchingFeatures?.matchedFeature || "-";
      case "matching_sentence_endings":
        return q.matchingSentenceEndings?.correctEnding || "-";
      case "sentence_completion":
        return q.sentenceCompletion?.answer || "-";
      case "summary_completion":
        return (q.summaryCompletion?.answers || []).join(", ") || "-";
      case "diagram_label_completion":
        return (
          (q.diagramLabelCompletion?.correctLabels || []).join(", ") || "-"
        );
      default:
        return "-";
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (questions.length === 0) return <p>Không có câu hỏi nào để hiển thị.</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Danh sách câu hỏi Reading</h2>
      <button onClick={logout}>Đăng xuất</button>
      <Link to="/reading/create" style={{ marginLeft: 10 }}>
        <button>Tạo câu hỏi mới</button>
      </Link>
      <table
        ref={tableRef}
        className="display min-w-full"
        style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Loại</th>
            <th>Nội dung câu hỏi</th>
            <th>Đáp án</th>
            <th>Phần</th>
            <th>Hình ảnh</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q._id}>
              <td>{q._id}</td>
              <td>{q.type}</td>
              <td>{renderQuestionContent(q)}</td>
              <td>{renderAnswer(q)}</td>
              <td>{q.part?.name || q.part || "-"}</td>
              <td>
                {q.image ? (
                  <img
                    src={q.image}
                    alt="Hình"
                    width={60}
                    onError={(e) => (e.target.src = "placeholder-image.jpg")}
                  />
                ) : (
                  "-"
                )}
              </td>
              <td>
                <Link to={`/reading/${q._id}`}>Chi tiết</Link> |{" "}
                <Link to={`/reading/edit/${q._id}`}>Sửa</Link> |{" "}
                <button
                  onClick={() => handleDelete(q._id)}
                  style={{
                    color: "red",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
