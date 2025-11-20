// app/admin/exams/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function AdminExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || JSON.parse(atob(token.split(".")[1])).role !== "admin") {
      alert("Chỉ Admin mới được vào!");
      router.push("/profile");
      return;
    }

    apiFetch("/exams")
      .then((data) => setExams(Array.isArray(data) ? data : []))
      .catch(() => alert("Lỗi tải đề thi"))
      .finally(() => setLoading(false));
  }, [router]);

  const togglePublic = async (id: string, current: boolean) => {
    await apiFetch(`/exams/${id}/public`, {
      method: "PATCH",
      body: JSON.stringify({ is588Public: !current }),
    });
    setExams((prev) =>
      prev.map((e) => (e._id === id ? { ...e, isPublic: !current } : e))
    );
  };

  if (loading)
    return (
      <div className="pt-20 text-center text-7xl font-bold text-purple-600">
        ĐANG TẢI ĐỀ THI...
      </div>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <Navbar />
      <div className="pt-20 container mx-auto px-6">
        <h1 className="text-8xl font-extrabold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          QUẢN LÝ ĐỀ THI IELTS
        </h1>
        <Link href="/admin/exams/new">
          <button className="mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-16 py-8 rounded-3xl text-4xl font-extrabold shadow-3xl hover:scale-110 transition block mx-auto">
            + TẠO ĐỀ THI MỚI
          </button>
        </Link>

        <div className="grid gap-12">
          {exams.map((exam) => (
            <div
              key={exam._id}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-3xl p-12 border border-purple-200">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-5xl font-extrabold text-purple-700">
                    {exam.title}
                  </h3>
                  <p className="text-2xl text-gray-600 mt-4">
                    {exam.description}
                  </p>
                </div>
                <span
                  className={`px-10 py-5 rounded-full text-white text-3xl font-bold ${exam.isPublic ? "bg-green-600" : "bg-red-600"}`}>
                  {exam.isPublic ? "PUBLIC" : "PRIVATE"}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-6 text-center">
                {["listening", "reading", "writing", "speaking"].map(
                  (skill) => (
                    <div
                      key={skill}
                      className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-2xl">
                      <p className="text-5xl font-bold text-purple-600">
                        {exam.skills[skill].length}
                      </p>
                      <p className="text-xl uppercase font-bold">{skill}</p>
                    </div>
                  )
                )}
              </div>
              <div className="mt-10 flex gap-6">
                <Link href={`/admin/exams/${exam._id}/edit`}>
                  <button className="flex-1 bg-blue-600 text-white py-6 rounded-2xl text-3xl font-bold hover:scale-105 transition">
                    SỬA ĐỀ
                  </button>
                </Link>
                <button
                  onClick={() => togglePublic(exam._id, exam.isPublic)}
                  className={`flex-1 py-6 rounded-2xl text-3xl font-bold transition ${exam.isPublic ? "bg-red-600" : "bg-green-600"} text-white`}>
                  {exam.isPublic ? "ẨN ĐI" : "PUBLIC NGAY"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
