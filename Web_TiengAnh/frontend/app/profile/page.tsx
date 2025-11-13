// app/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { apiFetch } from "@/lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // ĐÚNG 100%: GỌI /user/me – KHÔNG PHẢI /user
    apiFetch("/user/me")
      .then((data) => {
        setUser(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
          password: "",
        });
      })
      .catch((err) => {
        console.error("Lỗi tải profile:", err);
        alert("Không thể tải thông tin: " + err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiFetch("/user/me", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setUser(updated);
      alert("Cập nhật thành công!");
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
        <Navbar />
        <div className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-5xl font-bold animate-pulse text-purple-600">
            ĐANG TẢI PROFILE...
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex flex-col">
        <Navbar />
        <div className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-5xl font-bold text-red-600">
            KHÔNG TÌM THẤY USER
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-gray-900 dark:to-black">
      <Navbar />
      <div className="flex-1 pt-20 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <h1 className="text-8xl font-extrabold text-center mb-20 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
            HỒ SƠ CÁ NHÂN
          </h1>

          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-3xl shadow-3xl p-16 border border-white/30">
            {/* AVATAR + INFO */}
            <div className="flex flex-col md:flex-row items-center gap-16 mb-20">
              <div className="relative group">
                <div className="w-56 h-56 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 rounded-full flex items-center justify-center text-white text-9xl font-bold shadow-3xl ring-8 ring-white/50">
                  {user.name?.[0]?.toUpperCase() ||
                    user.username[0].toUpperCase()}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    Change Avatar
                  </span>
                </div>
              </div>

              <div className="text-center md:text-left">
                <h2 className="text-7xl font-extrabold text-gray-800 dark:text-white">
                  {user.name || "Chưa đặt tên"}
                </h2>
                <p className="text-4xl text-gray-600 dark:text-gray-300 mt-4">
                  @{user.username}
                </p>
                <p className="text-3xl text-gray-500 dark:text-gray-400 mt-6">
                  {user.email}
                </p>
                <div className="mt-10">
                  <span
                    className={`px-12 py-6 rounded-full text-white font-extrabold text-3xl shadow-2xl ${
                      user.roleId?.name === "admin"
                        ? "bg-gradient-to-r from-red-600 to-pink-600"
                        : user.roleId?.name === "editor"
                          ? "bg-gradient-to-r from-orange-600 to-yellow-600"
                          : "bg-gradient-to-r from-emerald-600 to-teal-600"
                    }`}>
                    {user.roleId?.name?.toUpperCase() || "HỌC VIÊN"}
                  </span>
                </div>
              </div>
            </div>

            {/* FORM CẬP NHẬT */}
            <form onSubmit={handleUpdate} className="space-y-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <label className="block text-3xl font-bold mb-6 text-gray-700 dark:text-gray-300">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-10 py-6 rounded-2xl border-4 border-purple-200 focus:border-purple-600 focus:ring-8 focus:ring-purple-100 text-2xl transition shadow-lg"
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div>
                  <label className="block text-3xl font-bold mb-6 text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full px-10 py-6 rounded-2xl border-4 border-pink-200 focus:border-pink-600 focus:ring-8 focus:ring-pink-100 text-2xl transition shadow-lg"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-3xl font-bold mb-6 text-gray-700 dark:text-gray-300">
                  Mật khẩu mới (để trống nếu không đổi)
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full px-10 py-6 rounded-2xl border-4 border-blue-200 focus:border-blue-600 focus:ring-8 focus:ring-blue-100 text-2xl transition shadow-lg"
                  placeholder="••••••••••••"
                />
              </div>

              <div className="text-center pt-12">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-32 py-10 rounded-full text-4xl font-extrabold hover:scale-110 transition shadow-3xl disabled:opacity-70">
                  {saving ? "ĐANG LƯU..." : "CẬP NHẬT NGAY"}
                </button>
              </div>
            </form>

            <div className="mt-20 text-center text-gray-600 dark:text-gray-400 text-2xl">
              <p>
                Tham gia:{" "}
                <span className="font-bold text-purple-600">
                  {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </p>
              <p className="mt-6">
                Trạng thái:{" "}
                <span className="text-5xl text-emerald-600 font-extrabold">
                  HOẠT ĐỘNG
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
