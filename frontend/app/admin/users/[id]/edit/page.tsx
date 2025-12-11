// app/admin/users/[id]/edit/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { apiFetch } from "@/lib/api";

export default function EditUserPage() {
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    roleId: "",
  });
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  // BẢO VỆ CHỈ ADMIN MỚI VÀO
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("CẢNH BÁO: Bạn chưa đăng nhập! Chỉ Admin mới được chỉnh sửa user!");
      router.push("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "admin") {
        alert("CẤM VÀO! Chỉ Admin mới được truy cập khu vực này!");
        router.push("/profile");
        return;
      }
      setCheckingAuth(false);
    } catch {
      localStorage.removeItem("token");
      alert("Token lỗi! Vui lòng đăng nhập lại.");
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!checkingAuth) {
      Promise.all([
        apiFetch(`/admin/users/${id}`),
        apiFetch("/admin/users/roles"),
      ])
        .then(([userData, userList]) => {
          setForm({
            username: userData.username,
            name: userData.name || "",
            email: userData.email,
            password: "",
            roleId: userData.roleId?._id || userData.roleId || "",
          });

          const uniqueRoles = Array.from(
            new Map(
              (Array.isArray(userList) ? userList : [])
                .filter((u: any) => u.roleId?._id)
                .map((u: any) => [u.roleId._id, u.roleId])
            ).values()
          );
          setRoles(uniqueRoles);
        })
        .catch(() => alert("Lỗi tải dữ liệu"))
        .finally(() => setLoading(false));
    }
  }, [id, checkingAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body: any = { ...form };
    if (!body.password) delete body.password;

    try {
      await apiFetch(`/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      alert("CẬP NHẬT THÀNH CÔNG!");
      router.push("/admin/users");
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật");
    }
  };

  // HIỆN LOADING ĐẸP KHI ĐANG KIỂM TRA QUYỀN
  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 border-8 border-white border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
          <p className="text-5xl font-extrabold text-white animate-pulse">
            {checkingAuth
              ? "ĐANG KIỂM TRA QUYỀN ADMIN..."
              : "ĐANG TẢI DỮ LIỆU..."}
          </p>
          <p className="text-2xl text-yellow-400 mt-6">
            Chỉ Admin mới được vào!
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20">
        <div className="container mx-auto px-6 py-16 max-w-5xl">
          <h1 className="text-8xl font-extrabold text-center mb-20 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
            SỬA THÔNG TIN USER
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-3xl p-16 space-y-12 border border-purple-200">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <label className="block text-3xl font-bold mb-6 text-purple-700">
                  Username
                </label>
                <input
                  required
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className="w-full px-10 py-6 rounded-2xl border-4 border-purple-300 focus:border-purple-600 focus:ring-8 focus:ring-purple-100 text-2xl transition shadow-lg"
                />
              </div>
              <div>
                <label className="block text-3xl font-bold mb-6 text-pink-700">
                  Họ tên
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-10 py-6 rounded-2xl border-4 border-pink-300 focus:border-pink-600 focus:ring-8 focus:ring-pink-100 text-2xl transition shadow-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-3xl font-bold mb-6 text-blue-700">
                Email
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-10 py-6 rounded-2xl border-4 border-blue-300 focus:border-blue-600 focus:ring-8 focus:ring-blue-100 text-2xl transition shadow-lg"
              />
            </div>

            <div>
              <label className="block text-3xl font-bold mb-6 text-green-700">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Để trống nếu không đổi"
                className="w-full px-10 py-6 rounded-2xl border-4 border-green-300 focus:border-green-600 focus:ring-8 focus:ring-green-100 text-2xl transition shadow-lg"
              />
            </div>

            <div>
              <label className="block text-3xl font-bold mb-6 text-orange-700">
                Vai trò
              </label>
              <select
                required
                value={form.roleId}
                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                className="w-full px-10 py-6 rounded-2xl border-4 border-orange-300 focus:border-orange-600 focus:ring-8 focus:ring-orange-100 text-2xl transition shadow-lg">
                <option value="">-- Chọn vai trò --</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-10 pt-12">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-8 rounded-2xl text-4xl font-extrabold hover:scale-110 transition shadow-3xl">
                CẬP NHẬT NGAY
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-800 text-white py-8 rounded-2xl text-4xl font-extrabold hover:scale-110 transition shadow-3xl">
                HỦY
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </main>
  );
}
