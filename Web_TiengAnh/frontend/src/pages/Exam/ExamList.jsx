// // import { useState, useEffect } from "react";
// // import axios from "axios";
// // import { useNavigate } from "react-router-dom";

// // export default function ListExam() {
// //   const [exams, setExams] = useState([]);
// //   const [page, setPage] = useState(1);
// //   const [totalPages, setTotalPages] = useState(1);
// //   const [loading, setLoading] = useState(false);
// //   const [form, setForm] = useState({
// //     title: "",
// //     description: "",
// //     durationMinutes: 60,
// //   });
// //   const [editingExamId, setEditingExamId] = useState(null);
// //   const navigate = useNavigate();
// //   const role = localStorage.getItem("role");

// //   const fetchExams = async (pageNum) => {
// //     setLoading(true);
// //     try {
// //       const token = localStorage.getItem("token");
// //       if (!token) {
// //         navigate("/login");
// //         return;
// //       }

// //       const response = await axios.get(
// //         `http://localhost:3000/api/exams/paginated?page=${pageNum}&limit=10`,
// //         {
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );

// //       setExams(response.data.data);
// //       setTotalPages(response.data.totalPages);
// //     } catch (err) {
// //       alert("Lỗi: " + (err.response?.data?.message || err.message));
// //       if (err.response?.status === 401) {
// //         navigate("/login");
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchExams(page);
// //   }, [page]);

// //   const handlePageChange = (newPage) => {
// //     if (newPage >= 1 && newPage <= totalPages) {
// //       setPage(newPage);
// //     }
// //   };

// //   const handleFormChange = (e) => {
// //     const { name, value } = e.target;
// //     setForm((prev) => ({ ...prev, [name]: value }));
// //   };

// //   const handleCreate = async (e) => {
// //     e.preventDefault();
// //     try {
// //       const token = localStorage.getItem("token");
// //       await axios.post("http://localhost:3000/api/exams", form, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       alert("Tạo đề thi thành công!");
// //       setForm({ title: "", description: "", durationMinutes: 60 });
// //       fetchExams(page);
// //     } catch (err) {
// //       alert("Lỗi: " + (err.response?.data?.message || err.message));
// //     }
// //   };

// //   const handleUpdate = async (e) => {
// //     e.preventDefault();
// //     try {
// //       const token = localStorage.getItem("token");
// //       await axios.put(
// //         `http://localhost:3000/api/exams/${editingExamId}`,
// //         form,
// //         {
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );
// //       alert("Cập nhật đề thi thành công!");
// //       setEditingExamId(null);
// //       setForm({ title: "", description: "", durationMinutes: 60 });
// //       fetchExams(page);
// //     } catch (err) {
// //       alert("Lỗi: " + (err.response?.data?.message || err.message));
// //     }
// //   };

// //   const handleDelete = async (id) => {
// //     if (!window.confirm("Bạn có chắc muốn xóa đề thi này?")) return;
// //     try {
// //       const token = localStorage.getItem("token");
// //       await axios.delete(`http://localhost:3000/api/exams/${id}`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       alert("Xóa đề thi thành công!");
// //       fetchExams(page);
// //     } catch (err) {
// //       alert("Lỗi: " + (err.response?.data?.message || err.message));
// //     }
// //   };

// //   const startEditing = (exam) => {
// //     setEditingExamId(exam._id);
// //     setForm({
// //       title: exam.title,
// //       description: exam.description,
// //       durationMinutes: exam.durationMinutes,
// //     });
// //   };

// //   if (role === "admin") {
// //     return (
// //       <div className="container mx-auto p-4">
// //         <h2 className="text-2xl font-bold mb-4">Quản lý đề thi</h2>

// //         {/* Form tạo/cập nhật đề thi */}
// //         <div className="mb-8 p-4 border rounded-lg shadow-sm">
// //           <h3 className="text-lg font-semibold mb-2">
// //             {editingExamId ? "Cập nhật đề thi" : "Tạo đề thi mới"}
// //           </h3>
// //           <form onSubmit={editingExamId ? handleUpdate : handleCreate}>
// //             <div className="mb-4">
// //               <label className="block text-sm font-medium">Tiêu đề</label>
// //               <input
// //                 type="text"
// //                 name="title"
// //                 value={form.title}
// //                 onChange={handleFormChange}
// //                 className="w-full p-2 border rounded"
// //                 placeholder="Nhập tiêu đề đề thi"
// //                 required
// //               />
// //             </div>
// //             <div className="mb-4">
// //               <label className="block text-sm font-medium">Mô tả</label>
// //               <textarea
// //                 name="description"
// //                 value={form.description}
// //                 onChange={handleFormChange}
// //                 className="w-full p-2 border rounded"
// //                 placeholder="Nhập mô tả (tùy chọn)"
// //               />
// //             </div>
// //             <div className="mb-4">
// //               <label className="block text-sm font-medium">
// //                 Thời gian (phút)
// //               </label>
// //               <input
// //                 type="number"
// //                 name="durationMinutes"
// //                 value={form.durationMinutes}
// //                 onChange={handleFormChange}
// //                 className="w-full p-2 border rounded"
// //                 min="1"
// //                 required
// //               />
// //             </div>
// //             <button
// //               type="submit"
// //               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
// //               {editingExamId ? "Cập nhật" : "Tạo"}
// //             </button>
// //             {editingExamId && (
// //               <button
// //                 type="button"
// //                 className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
// //                 onClick={() => {
// //                   setEditingExamId(null);
// //                   setForm({ title: "", description: "", durationMinutes: 60 });
// //                 }}>
// //                 Hủy
// //               </button>
// //             )}
// //           </form>
// //         </div>

// //         {/* Danh sách đề thi */}
// //         <h3 className="text-lg font-semibold mb-2">Danh sách đề thi</h3>
// //         {loading ? (
// //           <p className="text-center">Đang tải...</p>
// //         ) : exams.length === 0 ? (
// //           <p className="text-center">Không có đề thi nào.</p>
// //         ) : (
// //           <div className="grid gap-4">
// //             {exams.map((exam) => (
// //               <div
// //                 key={exam._id}
// //                 className="p-4 border rounded-lg shadow-sm hover:shadow-md transition">
// //                 <h3 className="text-xl font-semibold">{exam.title}</h3>
// //                 <p className="text-gray-600">
// //                   {exam.description || "Không có mô tả"}
// //                 </p>
// //                 <p className="text-sm text-gray-600">
// //                   Thời gian: {exam.durationMinutes} phút
// //                 </p>
// //                 <p className="text-sm text-gray-600">
// //                   Tạo lúc:{" "}
// //                   {new Date(exam.createdAt).toLocaleDateString("vi-VN")}
// //                 </p>
// //                 <div className="mt-2 flex gap-2">
// //                   <button
// //                     className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
// //                     onClick={() => startEditing(exam)}>
// //                     Sửa
// //                   </button>
// //                   <button
// //                     className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
// //                     onClick={() => handleDelete(exam._id)}>
// //                     Xóa
// //                   </button>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         )}
// //         <div className="flex justify-center gap-2 mt-4">
// //           <button
// //             className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
// //             onClick={() => handlePageChange(page - 1)}
// //             disabled={page === 1}>
// //             Trước
// //           </button>
// //           <span className="px-4 py-2">
// //             Trang {page} / {totalPages}
// //           </span>
// //           <button
// //             className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
// //             onClick={() => handlePageChange(page + 1)}
// //             disabled={page === totalPages}>
// //             Sau
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Giao diện cho user
// //   return (
// //     <div className="container mx-auto p-4">
// //       <h2 className="text-2xl font-bold mb-4">Danh sách đề thi</h2>
// //       {loading ? (
// //         <p className="text-center">Đang tải...</p>
// //       ) : exams.length === 0 ? (
// //         <p className="text-center">Không có đề thi nào.</p>
// //       ) : (
// //         <div className="grid gap-4">
// //           {exams.map((exam) => (
// //             <div
// //               key={exam._id}
// //               className="p-4 border rounded-lg shadow-sm hover:shadow-md transition">
// //               <h3 className="text-xl font-semibold">{exam.title}</h3>
// //               <p className="text-gray-600">
// //                 {exam.description || "Không có mô tả"}
// //               </p>
// //               <p className="text-sm text-gray-600">
// //                 Thời gian: {exam.durationMinutes} phút
// //               </p>
// //               <p className="text-sm text-gray-600">
// //                 Tạo lúc: {new Date(exam.createdAt).toLocaleDateString("vi-VN")}
// //               </p>
// //               <button
// //                 className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
// //                 onClick={() => navigate(`/exam/${exam._id}`)}>
// //                 Làm bài
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //       )}
// //       <div className="flex justify-center gap-2 mt-4">
// //         <button
// //           className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
// //           onClick={() => handlePageChange(page - 1)}
// //           disabled={page === 1}>
// //           Trước
// //         </button>
// //         <span className="px-4 py-2">
// //           Trang {page} / {totalPages}
// //         </span>
// //         <button
// //           className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
// //           onClick={() => handlePageChange(page + 1)}
// //           disabled={page === totalPages}>
// //           Sau
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function ListExam() {
//   const [exams, setExams] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     durationMinutes: 60,
//   });
//   const [editingExamId, setEditingExamId] = useState(null);
//   const navigate = useNavigate();
//   const role = localStorage.getItem("role");

//   const fetchExams = async (pageNum) => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         navigate("/login");
//         return;
//       }

//       const response = await axios.get(
//         `http://localhost:3000/api/exams/paginated?page=${pageNum}&limit=10`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       setExams(response.data.data);
//       setTotalPages(response.data.totalPages);
//     } catch (err) {
//       alert("Lỗi: " + (err.response?.data?.message || err.message));
//       if (err.response?.status === 401) {
//         navigate("/login");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchExams(page);
//   }, [page]);

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setPage(newPage);
//     }
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       await axios.post("http://localhost:3000/api/exams", form, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       alert("Tạo đề thi thành công!");
//       setForm({ title: "", description: "", durationMinutes: 60 });
//       fetchExams(page);
//     } catch (err) {
//       alert("Lỗi: " + (err.response?.data?.message || err.message));
//     }
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       await axios.put(
//         `http://localhost:3000/api/exams/${editingExamId}`,
//         form,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       alert("Cập nhật đề thi thành công!");
//       setEditingExamId(null);
//       setForm({ title: "", description: "", durationMinutes: 60 });
//       fetchExams(page);
//     } catch (err) {
//       alert("Lỗi: " + (err.response?.data?.message || err.message));
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Bạn có chắc muốn xóa đề thi này?")) return;
//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(`http://localhost:3000/api/exams/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       alert("Xóa đề thi thành công!");
//       fetchExams(page);
//     } catch (err) {
//       alert("Lỗi: " + (err.response?.data?.message || err.message));
//     }
//   };

//   const startEditing = (exam) => {
//     setEditingExamId(exam._id);
//     setForm({
//       title: exam.title,
//       description: exam.description,
//       durationMinutes: exam.durationMinutes,
//     });
//   };

//   if (role === "admin") {
//     return (
//       <div className="container mx-auto p-4">
//         <h2 className="text-2xl font-bold mb-4">Quản lý đề thi</h2>

//         {/* Form tạo/cập nhật đề thi */}
//         <div className="mb-8 p-4 border rounded-lg shadow-sm">
//           <h3 className="text-lg font-semibold mb-2">
//             {editingExamId ? "Cập nhật đề thi" : "Tạo đề thi mới"}
//           </h3>
//           <form onSubmit={editingExamId ? handleUpdate : handleCreate}>
//             <div className="mb-4">
//               <label className="block text-sm font-medium">Tiêu đề</label>
//               <input
//                 type="text"
//                 name="title"
//                 value={form.title}
//                 onChange={handleFormChange}
//                 className="w-full p-2 border rounded"
//                 placeholder="Nhập tiêu đề đề thi"
//                 required
//               />
//             </div>
//             <div className="mb-4">
//               <label className="block text-sm font-medium">Mô tả</label>
//               <textarea
//                 name="description"
//                 value={form.description}
//                 onChange={handleFormChange}
//                 className="w-full p-2 border rounded"
//                 placeholder="Nhập mô tả (tùy chọn)"
//               />
//             </div>
//             <div className="mb-4">
//               <label className="block text-sm font-medium">
//                 Thời gian (phút)
//               </label>
//               <input
//                 type="number"
//                 name="durationMinutes"
//                 value={form.durationMinutes}
//                 onChange={handleFormChange}
//                 className="w-full p-2 border rounded"
//                 min="1"
//                 required
//               />
//             </div>
//             <button
//               type="submit"
//               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
//               {editingExamId ? "Cập nhật" : "Tạo"}
//             </button>
//             {editingExamId && (
//               <button
//                 type="button"
//                 className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//                 onClick={() => {
//                   setEditingExamId(null);
//                   setForm({ title: "", description: "", durationMinutes: 60 });
//                 }}>
//                 Hủy
//               </button>
//             )}
//           </form>
//         </div>

//         {/* Danh sách đề thi */}
//         <h3 className="text-lg font-semibold mb-2">Danh sách đề thi</h3>
//         {loading ? (
//           <p className="text-center">Đang tải...</p>
//         ) : exams.length === 0 ? (
//           <p className="text-center">Không có đề thi nào.</p>
//         ) : (
//           <div className="grid gap-4">
//             {exams.map((exam) => (
//               <div
//                 key={exam._id}
//                 className="p-4 border rounded-lg shadow-sm hover:shadow-md transition">
//                 <h3 className="text-xl font-semibold">{exam.title}</h3>
//                 <p className="text-gray-600">
//                   {exam.description || "Không có mô tả"}
//                 </p>
//                 <p className="text-sm text-gray-600">
//                   Thời gian: {exam.durationMinutes} phút
//                 </p>
//                 <p className="text-sm text-gray-600">
//                   Tạo lúc:{" "}
//                   {new Date(exam.createdAt).toLocaleDateString("vi-VN")}
//                 </p>
//                 <div className="mt-2 flex gap-2">
//                   <button
//                     className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
//                     onClick={() => startEditing(exam)}>
//                     Sửa
//                   </button>
//                   <button
//                     className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                     onClick={() => handleDelete(exam._id)}>
//                     Xóa
//                   </button>
//                   <button
//                     className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//                     onClick={() => navigate(`/exams/${exam._id}/admin`)}>
//                     Chi tiết đề thi
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//         <div className="flex justify-center gap-2 mt-4">
//           <button
//             className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//             onClick={() => handlePageChange(page - 1)}
//             disabled={page === 1}>
//             Trước
//           </button>
//           <span className="px-4 py-2">
//             Trang {page} / {totalPages}
//           </span>
//           <button
//             className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//             onClick={() => handlePageChange(page + 1)}
//             disabled={page === totalPages}>
//             Sau
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Giao diện cho user
//   return (
//     <div className="container mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-4">Danh sách đề thi</h2>
//       {loading ? (
//         <p className="text-center">Đang tải...</p>
//       ) : exams.length === 0 ? (
//         <p className="text-center">Không có đề thi nào.</p>
//       ) : (
//         <div className="grid gap-4">
//           {exams.map((exam) => (
//             <div
//               key={exam._id}
//               className="p-4 border rounded-lg shadow-sm hover:shadow-md transition">
//               <h3 className="text-xl font-semibold">{exam.title}</h3>
//               <p className="text-gray-600">
//                 {exam.description || "Không có mô tả"}
//               </p>
//               <p className="text-sm text-gray-600">
//                 Thời gian: {exam.durationMinutes} phút
//               </p>
//               <p className="text-sm text-gray-600">
//                 Tạo lúc: {new Date(exam.createdAt).toLocaleDateString("vi-VN")}
//               </p>
//               <button
//                 className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//                 onClick={() => navigate(`/exams/${exam._id}`)} // Sửa từ /exam/ thành /exams/
//               >
//                 Làm bài
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//       <div className="flex justify-center gap-2 mt-4">
//         <button
//           className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//           onClick={() => handlePageChange(page - 1)}
//           disabled={page === 1}>
//           Trước
//         </button>
//         <span className="px-4 py-2">
//           Trang {page} / {totalPages}
//         </span>
//         <button
//           className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//           onClick={() => handlePageChange(page + 1)}
//           disabled={page === totalPages}>
//           Sau
//         </button>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ListExam() {
  const [exams, setExams] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    durationMinutes: 60,
  });
  const [editingExamId, setEditingExamId] = useState(null);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const fetchExams = async (pageNum) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `http://localhost:3000/api/exams/paginated?page=${pageNum}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setExams(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams(page);
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/api/exams", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Tạo đề thi thành công!");
      setForm({ title: "", description: "", durationMinutes: 60 });
      fetchExams(page);
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/exams/${editingExamId}`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Cập nhật đề thi thành công!");
      setEditingExamId(null);
      setForm({ title: "", description: "", durationMinutes: 60 });
      fetchExams(page);
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa đề thi này?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/exams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Xóa đề thi thành công!");
      fetchExams(page);
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const startEditing = (exam) => {
    setEditingExamId(exam._id);
    setForm({
      title: exam.title,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
    });
  };

  const renderForm = () => (
    <div className="mb-10 p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {editingExamId ? "Cập nhật đề thi" : "Tạo đề thi mới"}
      </h3>
      <form onSubmit={editingExamId ? handleUpdate : handleCreate}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Tiêu đề
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleFormChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
            placeholder="Nhập tiêu đề đề thi"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleFormChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
            placeholder="Nhập mô tả (tùy chọn)"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Thời gian (phút)
          </label>
          <input
            type="number"
            name="durationMinutes"
            value={form.durationMinutes}
            onChange={handleFormChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
            min="1"
            required
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-md hover:bg-blue-700 transition">
            {editingExamId ? "Cập nhật" : "Tạo"}
          </button>
          {editingExamId && (
            <button
              type="button"
              className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 transition"
              onClick={() => {
                setEditingExamId(null);
                setForm({ title: "", description: "", durationMinutes: 60 });
              }}>
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );

  const renderExamList = () => (
    <div className="grid gap-4">
      {exams.map((exam) => (
        <div
          key={exam._id}
          className="p-6 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition duration-300">
          <h3 className="text-xl font-semibold text-gray-800">{exam.title}</h3>
          <p className="text-gray-600 mb-1">
            {exam.description || "Không có mô tả"}
          </p>
          <p className="text-sm text-gray-500">
            Thời gian: {exam.durationMinutes} phút
          </p>
          <p className="text-sm text-gray-500">
            Tạo lúc: {new Date(exam.createdAt).toLocaleDateString("vi-VN")}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {role === "admin" ? (
              <>
                <button
                  className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-yellow-600 transition"
                  onClick={() => startEditing(exam)}>
                  Sửa
                </button>
                <button
                  className="bg-red-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-600 transition"
                  onClick={() => handleDelete(exam._id)}>
                  Xóa
                </button>
                <button
                  className="bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 transition"
                  onClick={() => navigate(`/exams/${exam._id}/admin`)}>
                  Chi tiết đề thi
                </button>
              </>
            ) : (
              <button
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition"
                onClick={() => navigate(`/exams/${exam._id}`)}>
                Làm bài
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPagination = () => (
    <div className="flex justify-center items-center gap-3 mt-6">
      <button
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}>
        Trước
      </button>
      <span className="text-gray-600 font-medium">
        Trang {page} / {totalPages}
      </span>
      <button
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}>
        Sau
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        {role === "admin" ? "Quản lý đề thi" : "Danh sách đề thi"}
      </h2>

      {role === "admin" && renderForm()}

      {loading ? (
        <p className="text-center text-gray-500">Đang tải...</p>
      ) : exams.length === 0 ? (
        <p className="text-center text-gray-500">Không có đề thi nào.</p>
      ) : (
        renderExamList()
      )}

      {renderPagination()}
    </div>
  );
}
