// // app/admin/exams/page.tsx
// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Navbar from "@/components/navbar";
// import Footer from "@/components/footer";
// import { apiFetch } from "@/lib/api";
// import Link from "next/link";

// export default function AdminExamsPage() {
//   const [exams, setExams] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token || JSON.parse(atob(token.split(".")[1])).role !== "admin") {
//       alert("Chỉ Admin mới được vào!");
//       router.push("/profile");
//       return;
//     }

//     apiFetch("/exams")
//       .then((data) => setExams(Array.isArray(data) ? data : []))
//       .catch(() => alert("Lỗi tải đề thi"))
//       .finally(() => setLoading(false));
//   }, [router]);

//   const togglePublic = async (id: string, current: boolean) => {
//     await apiFetch(`/exams/${id}/public`, {
//       method: "PATCH",
//       body: JSON.stringify({ is588Public: !current }),
//     });
//     setExams((prev) =>
//       prev.map((e) => (e._id === id ? { ...e, isPublic: !current } : e))
//     );
//   };

//   if (loading)
//     return (
//       <div className="pt-20 text-center text-7xl font-bold text-purple-600">
//         ĐANG TẢI ĐỀ THI...
//       </div>
//     );

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
//       <Navbar />
//       <div className="pt-20 container mx-auto px-6">
//         <h1 className="text-8xl font-extrabold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
//           QUẢN LÝ ĐỀ THI IELTS
//         </h1>
//         <Link href="/admin/exams/new">
//           <button className="mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-16 py-8 rounded-3xl text-4xl font-extrabold shadow-3xl hover:scale-110 transition block mx-auto">
//             + TẠO ĐỀ THI MỚI
//           </button>
//         </Link>

//         <div className="grid gap-12">
//           {exams.map((exam) => (
//             <div
//               key={exam._id}
//               className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-3xl p-12 border border-purple-200">
//               <div className="flex justify-between items-start mb-8">
//                 <div>
//                   <h3 className="text-5xl font-extrabold text-purple-700">
//                     {exam.title}
//                   </h3>
//                   <p className="text-2xl text-gray-600 mt-4">
//                     {exam.description}
//                   </p>
//                 </div>
//                 <span
//                   className={`px-10 py-5 rounded-full text-white text-3xl font-bold ${exam.isPublic ? "bg-green-600" : "bg-red-600"}`}>
//                   {exam.isPublic ? "PUBLIC" : "PRIVATE"}
//                 </span>
//               </div>
//               <div className="grid grid-cols-4 gap-6 text-center">
//                 {["listening", "reading", "writing", "speaking"].map(
//                   (skill) => (
//                     <div
//                       key={skill}
//                       className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-2xl">
//                       <p className="text-5xl font-bold text-purple-600">
//                         {exam.skills[skill].length}
//                       </p>
//                       <p className="text-xl uppercase font-bold">{skill}</p>
//                     </div>
//                   )
//                 )}
//               </div>
//               <div className="mt-10 flex gap-6">
//                 <Link href={`/admin/exams/${exam._id}/edit`}>
//                   <button className="flex-1 bg-blue-600 text-white py-6 rounded-2xl text-3xl font-bold hover:scale-105 transition">
//                     SỬA ĐỀ
//                   </button>
//                 </Link>
//                 <button
//                   onClick={() => togglePublic(exam._id, exam.isPublic)}
//                   className={`flex-1 py-6 rounded-2xl text-3xl font-bold transition ${exam.isPublic ? "bg-red-600" : "bg-green-600"} text-white`}>
//                   {exam.isPublic ? "ẨN ĐI" : "PUBLIC NGAY"}
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       <Footer />
//     </main>
//   );
// }

// app/admin/exams/page.tsx – PHONG CÁCH SPEAKING – SẠCH SẼ, CHUYÊN NGHIỆP
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
import { Plus, Eye, Edit, Trash2, Globe, EyeOff } from "lucide-react";

interface Exam {
  _id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  isPublished: boolean;
  createdAt: string;
  skills: {
    listening: any[];
    reading: any[];
    writing: any[];
    speaking: any[];
  };
}

export default function AdminExamsList() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/exams`
    )
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setExams(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch Exams:", err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("XÓA ĐỀ THI NÀY THẬT HẢ? KHÔNG LẤY LẠI ĐƯỢC ĐÂU!")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/exams/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok || res.status === 204) {
        setExams((prev) => prev.filter((e) => e._id !== id));
        alert("ĐÃ XÓA ĐỀ THI THÀNH CÔNG!");
      } else {
        alert("Xóa thất bại!");
      }
    } catch (err) {
      alert("Lỗi mạng hoặc chưa login admin!");
    }
  };

  const togglePublish = async (id: string, current: boolean) => {
    if (
      !confirm(
        current ? "Ẩn đề thi này?" : "Công khai đề thi này cho học viên làm?"
      )
    )
      return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/exams/${id}/publish`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: !current }),
        }
      );

      if (res.ok) {
        setExams((prev) =>
          prev.map((e) => (e._id === id ? { ...e, isPublished: !current } : e))
        );
        alert(current ? "ĐÃ ẨN THÀNH CÔNG!" : "ĐÃ PUBLIC THÀNH CÔNG!");
      } else {
        alert("Cập nhật trạng thái thất bại!");
      }
    } catch (err) {
      alert("Lỗi mạng!");
    }
  };

  const getTotalQuestions = (exam: Exam) => {
    return Object.values(exam.skills).reduce((sum, arr) => sum + arr.length, 0);
  };

  const getSkillNames = (exam: Exam) => {
    const active = [];
    if (exam.skills.listening.length > 0) active.push("Listening");
    if (exam.skills.reading.length > 0) active.push("Reading");
    if (exam.skills.writing.length > 0) active.push("Writing");
    if (exam.skills.speaking.length > 0) active.push("Speaking");
    return active.join(" + ") || "—";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-24 h-24 border-8 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-2xl font-bold text-gray-700">
            Đang tải danh sách đề thi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="mt-20 px-6 max-w-7xl mx-auto py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-6xl font-black text-gray-800">
              QUẢN LÝ ĐỀ THI
            </h1>
            <p className="text-2xl mt-4 text-gray-600">
              Tổng:{" "}
              <strong className="text-purple-600 font-bold">
                {exams.length}
              </strong>{" "}
              đề thi
            </p>
          </div>
          <Button asChild size="lg" className="text-xl px-10 py-6">
            <Link href="/admin/exams/new">
              <Plus className="mr-3 w-8 h-8" />
              TẠO ĐỀ THI MỚI
            </Link>
          </Button>
        </div>

        {exams.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl shadow-lg">
            <div className="w-32 h-32 mx-auto mb-8 bg-gray-200 border-2 border-dashed rounded-xl" />
            <p className="text-3xl text-gray-500 mb-10">Chưa có đề thi nào</p>
            <Button asChild size="lg">
              <Link href="/admin/exams/new">Tạo đề thi đầu tiên</Link>
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-center font-bold">#</TableHead>
                  <TableHead className="font-bold">Tiêu đề</TableHead>
                  <TableHead className="font-bold">Kỹ năng</TableHead>
                  <TableHead className="text-center font-bold">
                    Số câu
                  </TableHead>
                  <TableHead className="text-center font-bold">
                    Thời gian
                  </TableHead>
                  <TableHead className="text-center font-bold">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-center font-bold">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam, i) => (
                  <TableRow
                    key={exam._id}
                    className="hover:bg-gray-50 transition-colors">
                    <TableCell className="text-center font-bold text-gray-600">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium max-w-md">
                      <p className="font-semibold text-lg">{exam.title}</p>
                      {exam.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {exam.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getSkillNames(exam)}
                    </TableCell>
                    <TableCell className="text-center font-bold text-purple-600">
                      {getTotalQuestions(exam)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-lg">
                        {exam.durationMinutes} phút
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`px-4 py-1 ${
                          exam.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                        {exam.isPublished ? "PUBLIC" : "DRAFT"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-3">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/exams/${exam._id}`}>
                            <Eye className="w-5 h-5" />
                          </Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link href={`/admin/exams/${exam._id}/edit`}>
                            <Edit className="w-5 h-5" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            togglePublish(exam._id, exam.isPublished)
                          }
                          className={
                            exam.isPublished
                              ? "border-green-600 text-green-600"
                              : "border-gray-600"
                          }>
                          {exam.isPublished ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Globe className="w-5 h-5" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(exam._id)}>
                          <Trash2 className="w-5 h-5" />
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
