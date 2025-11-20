"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";

export default function AdminListeningQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // BẢO VỆ ADMIN
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập!");
      router.push("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "admin") {
        alert("CẤM VÀO! Chỉ Admin mới được quản lý câu hỏi!");
        router.push("/profile");
      }
    } catch {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/admin/questions/listening/listening-questions?page=${page}&limit=10&populate=section`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Lỗi tải dữ liệu");

        setQuestions(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        console.error("Lỗi fetch:", err);
        alert("Lỗi tải câu hỏi: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("XÓA THẬT HẢ ANH? Không cứu được đâu đấy!")) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/questions/listening/listening-questions/${id}`,
        { method: "DELETE", credentials: "include" }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Xóa thất bại");
      }

      setQuestions((prev) => prev.filter((q) => q._id !== id));
      alert("XÓA THÀNH CÔNG!");
    } catch (err: any) {
      alert("Lỗi xóa: " + err.message);
    }
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
        <p className="text-6xl font-extrabold text-white animate-pulse">
          ĐANG TẢI CÂU HỎI LISTENING...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Navbar />
      <div className="pt-20 container mx-auto px-6 max-w-7xl">
        <div className="flex justify-between items-center mb-16">
          <h1 className="text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            LISTENING QUESTIONS
          </h1>
          <Link href="/admin/skills/listening/questions/new">
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-6 rounded-3xl text-3xl font-extrabold shadow-2xl hover:scale-110 transition">
              + THÊM CÂU HỎI
            </button>
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-6xl font-bold text-gray-400 mb-8">
              Chưa có câu hỏi Listening nào
            </p>
            <Link href="/admin/skills/listening/questions/new">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-16 py-8 rounded-3xl text-4xl font-extrabold shadow-2xl hover:scale-110 transition">
                TẠO CÂU HỎI ĐẦU TIÊN NGAY!
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-3xl overflow-hidden border border-purple-200">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <tr>
                  <th className="p-6 text-left text-2xl">Section</th>
                  <th className="p-6 text-left text-2xl">Type</th>
                  <th className="p-6 text-left text-2xl">Tiêu đề</th>
                  <th className="p-6 text-left text-2xl">Số câu</th>
                  <th className="p-6 text-left text-2xl">Đáp án đúng</th>
                  <th className="p-6 text-left text-2xl">Audio</th>
                  <th className="p-6 text-left text-2xl">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr
                    key={q._id}
                    className="border-t hover:bg-purple-50 transition">
                    {/* SECTION – BẮT ĐÚNG 100% */}
                    {/* SECTION – SỬA CHỖ NÀY LÀ XONG MÃI MÃI */}
                    <td className="p-6 font-bold text-xl text-purple-700">
                      {q.section || "Chưa chọn Section"}
                    </td>
                    {/* TYPE */}
                    <td className="p-6">
                      <span className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-lg shadow-lg">
                        {formatType(q.type)}
                      </span>
                    </td>

                    {/* TIÊU ĐỀ */}
                    <td className="p-6 font-medium text-gray-800 max-w-xs truncate">
                      {q.title || "Chưa có tiêu đề"}
                    </td>

                    {/* SỐ CÂU HỎI CON */}
                    <td className="p-6 text-center font-bold text-2xl text-blue-600">
                      {q.subQuestions?.length || 0}
                    </td>

                    {/* ĐÁP ÁN ĐÚNG – HIỆN THỊ ĐẸP NHƯ MƠ */}
                    <td className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {q.subQuestions?.map((sq: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-green-600 text-white rounded-full font-bold text-sm shadow">
                            {idx + 1}. {sq.correctAnswer}
                          </span>
                        )) || (
                          <span className="text-gray-400">Chưa có đáp án</span>
                        )}
                      </div>
                    </td>

                    {/* AUDIO */}
                    <td className="p-6">
                      {q.audio ? (
                        <audio controls className="h-12 w-64">
                          <source
                            src={`http://localhost:3000${q.audio}`}
                            type="audio/mpeg"
                          />
                          Không hỗ trợ
                        </audio>
                      ) : (
                        <span className="text-red-500 font-bold">
                          Không có audio
                        </span>
                      )}
                    </td>

                    {/* HÀNH ĐỘNG */}
                    <td className="p-6 space-x-3">
                      <Link
                        href={`/admin/skills/listening/questions/${q._id}/edit`}>
                        <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold hover:scale-110 transition shadow-lg">
                          SỬA
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(q._id)}
                        className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-8 py-4 rounded-xl font-bold hover:scale-110 transition shadow-lg">
                        XÓA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PHÂN TRANG */}
            <div className="p-8 flex justify-center gap-8 bg-gray-50 border-t">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-12 py-6 bg-purple-600 text-white rounded-xl text-2xl font-bold disabled:opacity-50 hover:scale-110 transition disabled:cursor-not-allowed">
                TRƯỚC
              </button>
              <span className="text-3xl font-bold self-center text-purple-700">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-12 py-6 bg-purple-600 text-white rounded-xl text-2xl font-bold disabled:opacity-50 hover:scale-110 transition disabled:cursor-not-allowed">
                SAU
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
