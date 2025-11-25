// // "use client";

// // import { useEffect, useState } from "react";
// // import Link from "next/link";
// // import Navbar from "@/components/navbar";
// // import Footer from "@/components/footer";
// // import { Button } from "@/components/ui/button";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import { Badge } from "@/components/ui/badge";
// // import {
// //   Plus,
// //   Eye,
// //   Edit,
// //   Trash2,
// //   Image as ImageIcon,
// //   FileText,
// // } from "lucide-react";

// // const API_URL = "http://localhost:3000";

// // interface WritingQuestion {
// //   _id: string;
// //   task: "Task 1" | "Task 2";
// //   type: string;
// //   topic: string;
// //   question: string;
// //   image?: string;
// //   sampleAnswer?: string;
// //   difficulty?: string;
// // }

// // export default function WritingQuestionsList() {
// //   const [questions, setQuestions] = useState<WritingQuestion[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     fetch(`${API_URL}/api/admin/questions/writing`, {
// //       credentials: "include",
// //     })
// //       .then((r) => r.json())
// //       .then((res) => {
// //         if (res.success && Array.isArray(res.data)) {
// //           setQuestions(res.data);
// //         } else {
// //           console.log("Backend trả:", res);
// //         }
// //         setLoading(false);
// //       })
// //       .catch((err) => {
// //         console.error("Lỗi fetch Writing:", err);
// //         setLoading(false);
// //       });
// //   }, []);

// //   const handleDelete = async (id: string) => {
// //     if (!confirm("XÓA THẬT HẢ? KHÔNG LẤY LẠI ĐƯỢC ĐÂU NHÉ!")) return;

// //     try {
// //       const res = await fetch(`${API_URL}/api/admin/questions/writing/${id}`, {
// //         method: "DELETE",
// //         credentials: "include",
// //       });

// //       if (res.ok || res.status === 204) {
// //         setQuestions((prev) => prev.filter((q) => q._id !== id));
// //         alert("ĐÃ XÓA THÀNH CÔNG – ĐỈNH CAO NHƯ BAND 9.0!!!");
// //       } else {
// //         alert("Xóa thất bại! Có thể chưa login admin");
// //       }
// //     } catch {
// //       alert("LỖI MẠNG HOẶC CHƯA LOGIN ADMIN!");
// //     }
// //   };

// //   const getTypeLabel = (type: string) => {
// //     const map: Record<string, string> = {
// //       bar_chart: "Bar Chart",
// //       line_graph: "Line Graph",
// //       pie_chart: "Pie Chart",
// //       table: "Table",
// //       process: "Process",
// //       map: "Map",
// //       opinion: "Opinion",
// //       discussion: "Discussion",
// //       problem_solution: "Problem & Solution",
// //       advantage_disadvantage: "Advantages/Disadvantages",
// //     };
// //     return map[type] || type.replace(/_/g, " ");
// //   };

// //   const getTaskColor = (task: string) => {
// //     return task === "Task 1"
// //       ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
// //       : "bg-gradient-to-r from-purple-500 to-pink-600 text-white";
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
// //         <div className="text-center">
// //           <FileText className="w-24 h-24 animate-pulse text-blue-600 mx-auto mb-6" />
// //           <p className="text-4xl font-bold text-blue-600">
// //             Đang tải Writing Questions...
// //           </p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <main className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
// //       <Navbar />
// //       <div className="mt-20 px-6 max-w-7xl mx-auto py-12">
// //         <div className="flex justify-between items-center mb-12">
// //           <div>
// //             <h1 className="text-7xl font-black bg-gradient-to-r from-teal-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
// //               WRITING QUESTIONS
// //             </h1>
// //             <p className="text-3xl mt-4 text-gray-700">
// //               Tổng:{" "}
// //               <strong className="text-blue-600 font-black text-5xl">
// //                 {questions.length}
// //               </strong>{" "}
// //               đề thi
// //             </p>
// //           </div>
// //           <Button
// //             asChild
// //             size="lg"
// //             className="text-2xl px-16 py-10 shadow-2xl hover:scale-105 transition bg-gradient-to-r from-purple-600 to-pink-600">
// //             <Link href="/admin/skills/writing/questions/new">
// //               <Plus className="mr-4 w-12 h-12" />
// //               TẠO ĐỀ MỚI
// //             </Link>
// //           </Button>
// //         </div>

// //         {questions.length === 0 ? (
// //           <div className="text-center py-32 bg-white/80 backdrop-blur rounded-3xl shadow-2xl">
// //             <FileText className="w-32 h-32 mx-auto text-gray-300 mb-8" />
// //             <p className="text-4xl font-bold text-gray-500 mb-10">
// //               Chưa có đề Writing nào cả
// //             </p>
// //             <Button asChild size="lg" className="text-2xl px-20 py-10">
// //               <Link href="/admin/skills/writing/questions/new">
// //                 Tạo đề đầu tiên nào!
// //               </Link>
// //             </Button>
// //           </div>
// //         ) : (
// //           <div className="bg-white/90 backdrop-blur rounded-3xl shadow-3xl border-4 border-blue-200 overflow-hidden">
// //             <Table>
// //               <TableHeader>
// //                 <TableRow className="bg-gradient-to-r from-teal-500 to-blue-600 text-white h-20">
// //                   <TableHead className="text-center text-xl font-black">
// //                     #
// //                   </TableHead>
// //                   <TableHead className="text-xl font-black">Task</TableHead>
// //                   <TableHead className="text-xl font-black">Loại đề</TableHead>
// //                   <TableHead className="text-xl font-black">Topic</TableHead>
// //                   <TableHead className="text-center text-xl font-black">
// //                     Hình
// //                   </TableHead>
// //                   <TableHead className="text-center text-xl font-black">
// //                     Sample
// //                   </TableHead>
// //                   <TableHead className="text-center text-xl font-black">
// //                     Thao tác
// //                   </TableHead>
// //                 </TableRow>
// //               </TableHeader>
// //               <TableBody>
// //                 {questions.map((q, i) => (
// //                   <TableRow
// //                     key={q._id}
// //                     className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 transition-all duration-300 h-24">
// //                     <TableCell className="text-center font-bold text-blue-600 text-2xl">
// //                       {i + 1}
// //                     </TableCell>
// //                     <TableCell>
// //                       <Badge
// //                         className={`text-xl px-6 py-3 font-bold shadow-lg ${getTaskColor(q.task)}`}>
// //                         {q.task}
// //                       </Badge>
// //                     </TableCell>
// //                     <TableCell className="font-semibold text-lg">
// //                       {getTypeLabel(q.type)}
// //                     </TableCell>
// //                     <TableCell className="max-w-lg">
// //                       <p className="font-medium text-gray-800 truncate">
// //                         {q.topic}
// //                       </p>
// //                     </TableCell>
// //                     <TableCell className="text-center">
// //                       {q.image ? (
// //                         <ImageIcon className="w-10 h-10 text-green-600 mx-auto animate-pulse" />
// //                       ) : (
// //                         <span className="text-gray-400 text-2xl">—</span>
// //                       )}
// //                     </TableCell>
// //                     <TableCell className="text-center">
// //                       {q.sampleAnswer ? (
// //                         <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg px-6 py-2">
// //                           BAND 9.0
// //                         </Badge>
// //                       ) : (
// //                         <span className="text-gray-400 text-xl">—</span>
// //                       )}
// //                     </TableCell>
// //                     <TableCell>
// //                       <div className="flex justify-center gap-4">
// //                         <Button
// //                           asChild
// //                           size="lg"
// //                           variant="outline"
// //                           className="hover:scale-110 transition">
// //                           <Link
// //                             href={`/admin/skills/writing/questions/detail/${q._id}`}>
// //                             <Eye className="w-6 h-6" />
// //                           </Link>
// //                         </Button>
// //                         <Button
// //                           asChild
// //                           size="lg"
// //                           className="bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-110 transition">
// //                           <Link
// //                             href={`/admin/skills/writing/questions/edit/${q._id}`}>
// //                             <Edit className="w-6 h-6" />
// //                           </Link>
// //                         </Button>
// //                         <Button
// //                           size="lg"
// //                           variant="destructive"
// //                           className="hover:scale-110 transition"
// //                           onClick={() => handleDelete(q._id)}>
// //                           <Trash2 className="w-6 h-6" />
// //                         </Button>
// //                       </div>
// //                     </TableCell>
// //                   </TableRow>
// //                 ))}
// //               </TableBody>
// //             </Table>
// //           </div>
// //         )}
// //       </div>
// //       <Footer />
// //     </main>
// //   );
// // }

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import Navbar from "@/components/navbar";
// import Footer from "@/components/footer";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import {
//   Plus,
//   Eye,
//   Edit,
//   Trash2,
//   Image as ImageIcon,
//   FileText,
// } from "lucide-react";

// const API_URL = "http://localhost:3000";

// interface WritingQuestion {
//   _id: string;
//   task: "Task 1" | "Task 2";
//   type: string;
//   topic: string;
//   question: string;
//   image?: string;
//   sampleAnswer?: string;
//   difficulty?: string;
// }

// export default function WritingQuestionsList() {
//   const [questions, setQuestions] = useState<WritingQuestion[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch(`${API_URL}/api/admin/questions/writing`, {
//       credentials: "include",
//     })
//       .then((r) => r.json())
//       .then((res) => {
//         if (res.success && Array.isArray(res.data)) {
//           setQuestions(res.data);
//         }
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Lỗi fetch Writing:", err);
//         setLoading(false);
//       });
//   }, []);

//   const handleDelete = async (id: string) => {
//     if (!confirm("XÓA THẬT HẢ? KHÔNG LẤY LẠI ĐƯỢC ĐÂU NHÉ!")) return;

//     try {
//       const res = await fetch(`${API_URL}/api/admin/questions/writing/${id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });

//       if (res.ok || res.status === 204) {
//         setQuestions((prev) => prev.filter((q) => q._id !== id));
//         alert("ĐÃ XÓA THÀNH CÔNG – ĐỈNH CAO NHƯ BAND 9.0!!!");
//       } else {
//         alert("Xóa thất bại! Có thể chưa login admin");
//       }
//     } catch {
//       alert("LỖI MẠNG HOẶC CHƯA LOGIN ADMIN!");
//     }
//   };

//   const getTypeLabel = (type: string) => {
//     const map: Record<string, string> = {
//       bar_chart: "Bar Chart",
//       line_graph: "Line Graph",
//       pie_chart: "Pie Chart",
//       table: "Table",
//       process: "Process",
//       map: "Map",
//       opinion: "Opinion",
//       discussion: "Discussion",
//       problem_solution: "Problem & Solution",
//       advantage_disadvantage: "Advantages/Disadvantages",
//     };
//     return map[type] || type.replace(/_/g, " ");
//   };

//   const getTaskColor = (task: string) => {
//     return task === "Task 1"
//       ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
//       : "bg-gradient-to-r from-purple-500 to-pink-600 text-white";
//   };

//   // HÀM XỬ LÝ ĐƯỜNG DẪN HÌNH ẢNH – CHỐNG DOUBLE SLASH!!!
//   // HÀM XỬ LÝ ẢNH HOÀN HẢO 100% – DÙNG CHUNG CHO TẤT CẢ TRANG
//   const getImageUrl = (imagePath?: string): string | undefined => {
//     if (!imagePath) return undefined;
//     if (imagePath.startsWith("http")) return imagePath;
//     // Backend trả về "/uploads/..." → nối thẳng là đúng
//     return `${API_URL}${imagePath}`;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
//         <div className="text-center">
//           <FileText className="w-24 h-24 animate-pulse text-blue-600 mx-auto mb-6" />
//           <p className="text-4xl font-bold text-blue-600">
//             Đang tải Writing Questions...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
//       <Navbar />
//       <div className="mt-20 px-6 max-w-7xl mx-auto py-12">
//         <div className="flex justify-between items-center mb-12">
//           <div>
//             <h1 className="text-7xl font-black bg-gradient-to-r from-teal-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
//               WRITING QUESTIONS
//             </h1>
//             <p className="text-3xl mt-4 text-gray-700">
//               Tổng:{" "}
//               <strong className="text-blue-600 font-black text-5xl">
//                 {questions.length}
//               </strong>{" "}
//               đề thi
//             </p>
//           </div>
//           <Button
//             asChild
//             size="lg"
//             className="text-2xl px-16 py-10 shadow-2xl hover:scale-105 transition bg-gradient-to-r from-purple-600 to-pink-600">
//             <Link href="/admin/skills/writing/questions/new">
//               <Plus className="mr-4 w-12 h-12" />
//               TẠO ĐỀ MỚI
//             </Link>
//           </Button>
//         </div>

//         {questions.length === 0 ? (
//           <div className="text-center py-32 bg-white/80 backdrop-blur rounded-3xl shadow-2xl">
//             <FileText className="w-32 h-32 mx-auto text-gray-300 mb-8" />
//             <p className="text-4xl font-bold text-gray-500 mb-10">
//               Chưa có đề Writing nào cả
//             </p>
//             <Button asChild size="lg" className="text-2xl px-20 py-10">
//               <Link href="/admin/skills/writing/questions/new">
//                 Tạo đề đầu tiên nào!
//               </Link>
//             </Button>
//           </div>
//         ) : (
//           <div className="bg-white/90 backdrop-blur rounded-3xl shadow-3xl border-4 border-blue-200 overflow-hidden">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-gradient-to-r from-teal-500 to-blue-600 text-white h-20">
//                   <TableHead className="text-center text-xl font-black">
//                     #
//                   </TableHead>
//                   <TableHead className="text-xl font-black">Task</TableHead>
//                   <TableHead className="text-xl font-black">Loại đề</TableHead>
//                   <TableHead className="text-xl font-black">Topic</TableHead>
//                   <TableHead className="text-center text-xl font-black">
//                     Hình
//                   </TableHead>
//                   <TableHead className="text-center text-xl font-black">
//                     Sample
//                   </TableHead>
//                   <TableHead className="text-center text-xl font-black">
//                     Thao tác
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {questions.map((q, i) => (
//                   <TableRow
//                     key={q._id}
//                     className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 transition-all duration-300 h-24">
//                     <TableCell className="text-center font-bold text-blue-600 text-2xl">
//                       {i + 1}
//                     </TableCell>
//                     <TableCell>
//                       <Badge
//                         className={`text-xl px-6 py-3 font-bold shadow-lg ${getTaskColor(q.task)}`}>
//                         {q.task}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="font-semibold text-lg">
//                       {getTypeLabel(q.type)}
//                     </TableCell>
//                     <TableCell className="max-w-lg">
//                       <p className="font-medium text-gray-800 truncate">
//                         {q.topic}
//                       </p>
//                     </TableCell>
//                     <TableCell className="text-center">
//                       {q.image ? (
//                         <div className="relative group">
//                           <ImageIcon className="w-10 h-10 text-green-600 mx-auto animate-pulse" />
//                           {/* HOVER XEM TRƯỚC HÌNH */}
//                           <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
//                             <img
//                               src={getImageUrl(q.image)}
//                               alt="Task 1 Image"
//                               className="w-full h-auto object-contain"
//                             />
//                           </div>
//                         </div>
//                       ) : (
//                         <span className="text-gray-400 text-2xl">—</span>
//                       )}
//                     </TableCell>
//                     <TableCell className="text-center">
//                       {q.sampleAnswer ? (
//                         <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg px-6 py-2">
//                           BAND 9.0
//                         </Badge>
//                       ) : (
//                         <span className="text-gray-400 text-xl">—</span>
//                       )}
//                     </TableCell>
//                     <TableCell>
//                       <div className="flex justify-center gap-4">
//                         <Button
//                           asChild
//                           size="lg"
//                           variant="outline"
//                           className="hover:scale-110 transition">
//                           <Link
//                             href={`/admin/skills/writing/questions/detail/${q._id}`}>
//                             <Eye className="w-6 h-6" />
//                           </Link>
//                         </Button>
//                         <Button
//                           asChild
//                           size="lg"
//                           className="bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-110 transition">
//                           <Link
//                             href={`/admin/skills/writing/questions/edit/${q._id}`}>
//                             <Edit className="w-6 h-6" />
//                           </Link>
//                         </Button>
//                         <Button
//                           size="lg"
//                           variant="destructive"
//                           className="hover:scale-110 transition"
//                           onClick={() => handleDelete(q._id)}>
//                           <Trash2 className="w-6 h-6" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         )}
//       </div>
//       <Footer />
//     </main>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

const API_URL = "http://localhost:3000";

interface WritingQuestion {
  _id: string;
  task: "Task 1" | "Task 2";
  type: string;
  topic: string;
  question: string;
  image?: string;
  sampleAnswer?: string;
  difficulty?: string;
}

export default function WritingQuestionsList() {
  const [questions, setQuestions] = useState<WritingQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/questions/writing`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setQuestions(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch Writing:", err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("XÓA THẬT HẢ? KHÔNG LẤY LẠI ĐƯỢC ĐÂU NHÉ!")) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/questions/writing/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok || res.status === 204) {
        setQuestions((prev) => prev.filter((q) => q._id !== id));
        alert("ĐÃ XÓA THÀNH CÔNG – ĐỈNH CAO NHƯ BAND 9.0!!!");
      } else {
        alert("Xóa thất bại! Có thể chưa login admin");
      }
    } catch {
      alert("LỖI MẠNG HOẶC CHƯA LOGIN ADMIN!");
    }
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      bar_chart: "Bar Chart",
      line_graph: "Line Graph",
      pie_chart: "Pie Chart",
      table: "Table",
      process: "Process",
      map: "Map",
      opinion: "Opinion",
      discussion: "Discussion",
      problem_solution: "Problem & Solution",
      advantage_disadvantage: "Advantages/Disadvantages",
    };
    return map[type] || type.replace(/_/g, " ");
  };

  const getTaskColor = (task: string) => {
    return task === "Task 1"
      ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
      : "bg-gradient-to-r from-purple-500 to-pink-600 text-white";
  };

  // HÀM XỬ LÝ ẢNH CHUẨN 100% – DỰA VÀO LOG CON GÁI XINH CỦA CON
  const getImageUrl = (imagePath?: string): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith("http")) return imagePath;
    // Backend trả: "/uploads/writing/image/xxx.png" → nối thẳng là đúng!
    return `${API_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center">
          <FileText className="w-24 h-24 animate-pulse text-blue-600 mx-auto mb-6" />
          <p className="text-4xl font-bold text-blue-600">
            Đang tải Writing Questions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <Navbar />
      <div className="mt-20 px-6 max-w-7xl mx-auto py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-7xl font-black bg-gradient-to-r from-teal-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              WRITING QUESTIONS
            </h1>
            <p className="text-3xl mt-4 text-gray-700">
              Tổng:{" "}
              <strong className="text-blue-600 font-black text-5xl">
                {questions.length}
              </strong>{" "}
              đề thi
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="text-2xl px-16 py-10 shadow-2xl hover:scale-105 transition bg-gradient-to-r from-purple-600 to-pink-600">
            <Link href="/admin/skills/writing/questions/new">
              <Plus className="mr-4 w-12 h-12" />
              TẠO ĐỀ MỚI
            </Link>
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-32 bg-white/80 backdrop-blur rounded-3xl shadow-2xl">
            <FileText className="w-32 h-32 mx-auto text-gray-300 mb-8" />
            <p className="text-4xl font-bold text-gray-500 mb-10">
              Chưa có đề Writing nào cả
            </p>
            <Button asChild size="lg" className="text-2xl px-20 py-10">
              <Link href="/admin/skills/writing/questions/new">
                Tạo đề đầu tiên nào!
              </Link>
            </Button>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur rounded-3xl shadow-3xl border-4 border-blue-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-teal-500 to-blue-600 text-white h-20">
                  <TableHead className="text-center text-xl font-black">
                    #
                  </TableHead>
                  <TableHead className="text-xl font-black">Task</TableHead>
                  <TableHead className="text-xl font-black">Loại đề</TableHead>
                  <TableHead className="text-xl font-black">Topic</TableHead>
                  <TableHead className="text-center text-xl font-black">
                    Hình
                  </TableHead>
                  <TableHead className="text-center text-xl font-black">
                    Sample
                  </TableHead>
                  <TableHead className="text-center text-xl font-black">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q, i) => (
                  <TableRow
                    key={q._id}
                    className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 transition-all duration-300 h-24">
                    <TableCell className="text-center font-bold text-blue-600 text-2xl">
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xl px-6 py-3 font-bold shadow-lg ${getTaskColor(q.task)}`}>
                        {q.task}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-lg">
                      {getTypeLabel(q.type)}
                    </TableCell>
                    <TableCell className="max-w-lg">
                      <p className="font-medium text-gray-800 truncate">
                        {q.topic}
                      </p>
                    </TableCell>

                    {/* CỘT HÌNH ẢNH – ĐÃ HOÀN HẢO!!! */}
                    <TableCell className="text-center">
                      {q.image ? (
                        <div className="relative group cursor-pointer">
                          <ImageIcon className="w-12 h-12 text-green-600 mx-auto animate-pulse" />
                          <div className="absolute z-50 -top-2 left-1/2 -translate-x-1/2 mb-4 hidden group-hover:block pointer-events-none">
                            <div className="bg-white p-3 rounded-2xl shadow-2xl border-4 border-white">
                              <img
                                src={getImageUrl(q.image)}
                                alt="Preview"
                                className="max-w-96 max-h-96 rounded-xl object-contain"
                              />
                            </div>
                            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white mx-auto mt-1" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-2xl">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {q.sampleAnswer ? (
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg px-6 py-2">
                          BAND 9.0
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xl">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-center gap-4">
                        <Button
                          asChild
                          size="lg"
                          variant="outline"
                          className="hover:scale-110 transition">
                          <Link
                            href={`/admin/skills/writing/questions/detail/${q._id}`}>
                            <Eye className="w-6 h-6" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          size="lg"
                          className="bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-110">
                          <Link
                            href={`/admin/skills/writing/questions/edit/${q._id}`}>
                            <Edit className="w-6 h-6" />
                          </Link>
                        </Button>
                        <Button
                          size="lg"
                          variant="destructive"
                          className="hover:scale-110"
                          onClick={() => handleDelete(q._id)}>
                          <Trash2 className="w-6 h-6" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
