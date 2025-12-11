// app/admin/users/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { apiFetch } from "@/lib/api";

interface Role {
  _id: string;
  name: string;
}
interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  roleId?: Role;
}

export default function ViewUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // BẢO VỆ CHỈ ADMIN MỚI XEM ĐƯỢC
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("CẢNH BÁO: Bạn chưa đăng nhập!");
      router.push("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "admin") {
        alert("CẤM VÀO! Chỉ Admin mới được xem chi tiết user!");
        router.push("/profile");
        return;
      }
      setCheckingAuth(false);
    } catch {
      localStorage.removeItem("token");
      alert("Token lỗi! Đăng nhập lại!");
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!checkingAuth) {
      apiFetch(`/admin/users/${id}`)
        .then((data) => setUser(data))
        .catch(() => alert("Không thể tải thông tin user"))
        .finally(() => setLoading(false));
    }
  }, [id, checkingAuth]);

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 border-8 border-white border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
          <p className="text-5xl font-extrabold text-white animate-pulse">
            {checkingAuth ? "ĐANG KIỂM TRA QUYỀN..." : "ĐANG TẢI USER..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-100 to-pink-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-6xl font-bold text-red-600">KHÔNG TÌM THẤY USER</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <h1 className="text-8xl font-extrabold text-center mb-20 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            CHI TIẾT USER
          </h1>

          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-3xl p-16 border border-purple-200">
            <div className="grid md:grid-cols-2 gap-12 text-3xl">
              <div>
                <p className="font-bold text-purple-700">Username:</p>
                <p className="mt-4 bg-purple-100 px-8 py-6 rounded-2xl">
                  {user.username}
                </p>
              </div>
              <div>
                <p className="font-bold text-pink-700">Họ tên:</p>
                <p className="mt-4 bg-pink-100 px-8 py-6 rounded-2xl">
                  {user.name || "Chưa đặt"}
                </p>
              </div>
              <div>
                <p className="font-bold text-blue-700">Email:</p>
                <p className="mt-4 bg-blue-100 px-8 py-6 rounded-2xl">
                  {user.email}
                </p>
              </div>
              <div>
                <p className="font-bold text-green-700">Vai trò:</p>
                <p className="mt-4 px-8 py-6 rounded-2xl">
                  <span
                    className={`inline-block px-10 py-4 rounded-full text-white font-extrabold text-2xl shadow-lg ${
                      user.roleId?.name === "admin"
                        ? "bg-red-600"
                        : user.roleId?.name === "editor"
                          ? "bg-orange-600"
                          : "bg-emerald-600"
                    }`}>
                    {user.roleId?.name?.toUpperCase() || "USER"}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-20 text-center space-x-12">
              <button
                onClick={() => router.back()}
                className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-16 py-8 rounded-2xl text-4xl font-extrabold hover:scale-110 transition shadow-3xl">
                QUAY LẠI
              </button>
              <button
                onClick={() => router.push(`/admin/users/${id}/edit`)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-16 py-8 rounded-2xl text-4xl font-extrabold hover:scale-110 transition shadow-3xl">
                SỬA USER
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
