// // app/admin/users/new/page.tsx
// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Navbar from "@/components/navbar";
// import Footer from "@/components/footer";
// import { apiFetch } from "@/lib/api";

// export default function NewUserPage() {
//   const [form, setForm] = useState({
//     username: "",
//     name: "",
//     email: "",
//     password: "",
//     roleId: "",
//   });
//   const [roles, setRoles] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   // DÙNG LUÔN API SAI NHƯNG LẤY roleId._id và roleId.name
//   useEffect(() => {
//     apiFetch("/admin/users/roles")
//       .then((data) => {
//         const userList = Array.isArray(data) ? data : [];
//         // TẠO DANH SÁCH ROLE DUY NHẤT TỪ roleId
//         const uniqueRoles = Array.from(
//           new Map(
//             userList
//               .filter((u: any) => u.roleId?._id)
//               .map((u: any) => [u.roleId._id, u.roleId])
//           ).values()
//         );
//         setRoles(uniqueRoles);
//         if (uniqueRoles.length > 0) {
//           setForm((prev) => ({ ...prev, roleId: uniqueRoles[0]._id }));
//         }
//       })
//       .catch(() => alert("Lỗi tải vai trò"))
//       .finally(() => setLoading(false));
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await apiFetch("/admin/users", {
//         method: "POST",
//         body: JSON.stringify(form),
//       });
//       alert("Tạo user thành công!");
//       router.push("/admin/users");
//     } catch (err: any) {
//       alert(err.message || "Lỗi tạo user");
//     }
//   };

//   return (
//     <main className="min-h-screen bg-background flex flex-col">
//       <Navbar />
//       <div className="flex-1 pt-16">
//         <div className="container mx-auto px-6 py-10">
//           <h1 className="text-4xl font-bold mb-10">Thêm User Mới</h1>
//           <form
//             onSubmit={handleSubmit}
//             className="bg-card p-8 rounded-xl shadow-lg max-w-2xl mx-auto space-y-6">
//             <input
//               required
//               placeholder="Username"
//               value={form.username}
//               onChange={(e) => setForm({ ...form, username: e.target.value })}
//               className="w-full p-4 border rounded-lg"
//             />
//             <input
//               required
//               placeholder="Họ tên"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className="w-full p-4 border rounded-lg"
//             />
//             <input
//               required
//               type="email"
//               placeholder="Email"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               className="w-full p-4 border rounded-lg"
//             />
//             <input
//               required
//               type="password"
//               placeholder="Mật khẩu"
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//               className="w-full p-4 border rounded-lg"
//             />

//             <select
//               required
//               value={form.roleId}
//               onChange={(e) => setForm({ ...form, roleId: e.target.value })}
//               className="w-full p-4 border rounded-lg"
//               disabled={loading}>
//               <option value="">
//                 {loading ? "Đang tải..." : "-- Chọn vai trò --"}
//               </option>
//               {roles.map((role) => (
//                 <option key={role._id} value={role._id}>
//                   {role.name.toUpperCase()}
//                 </option>
//               ))}
//             </select>

//             <div className="flex gap-4">
//               <button
//                 type="submit"
//                 className="flex-1 bg-green-600 text-white py-4 rounded-lg font-bold">
//                 TẠO NGAY
//               </button>
//               <button
//                 type="button"
//                 onClick={() => router.back()}
//                 className="flex-1 bg-gray-500 text-white py-4 rounded-lg">
//                 HỦY
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//       <Footer />
//     </main>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { apiFetch } from "@/lib/api";

export default function NewUserPage() {
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || JSON.parse(atob(token.split(".")[1])).role !== "admin") {
      alert("CẤM VÀO! Chỉ Admin mới được tạo user!");
      router.push("/profile");
      return;
    }
    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (!checkingAuth) {
      apiFetch("/admin/users/roles")
        .then((data) => {
          const userList = Array.isArray(data) ? data : [];
          const uniqueRoles = Array.from(
            new Map(
              userList
                .filter((u: any) => u.roleId?._id)
                .map((u: any) => [u.roleId._id, u.roleId])
            ).values()
          );
          setRoles(uniqueRoles);
          if (uniqueRoles.length > 0)
            setForm((prev) => ({ ...prev, roleId: uniqueRoles[0]._id }));
        })
        .catch(() => alert("Lỗi tải vai trò"))
        .finally(() => setLoading(false));
    }
  }, [checkingAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      alert("TẠO USER THÀNH CÔNG!");
      router.push("/admin/users");
    } catch (err: any) {
      alert(err.message || "Lỗi tạo user");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 border-8 border-white border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
          <p className="text-5xl font-extrabold text-white animate-pulse">
            CHỈ ADMIN MỚI ĐƯỢC TẠO USER!
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20">
        <div className="container mx-auto px-6 py-10 max-w-4xl">
          <h1 className="text-7xl font-extrabold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            THÊM USER MỚI
          </h1>
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-3xl p-16 space-y-10">
            {/* Form giống hệt cũ nhưng đẹp hơn */}
            <input
              required
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-8 py-6 rounded-2xl border-4 border-purple-200 focus:border-purple-600 text-2xl"
            />
            <input
              required
              placeholder="Họ tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-8 py-6 rounded-2xl border-4 border-pink-200 focus:border-pink-600 text-2xl"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-8 py-6 rounded-2xl border-4 border-blue-200 focus:border-blue-600 text-2xl"
            />
            <input
              required
              type="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-8 py-6 rounded-2xl border-4 border-green-200 focus:border-green-600 text-2xl"
            />
            <select
              required
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              className="w-full px-8 py-6 rounded-2xl border-4 border-yellow-200 focus:border-yellow-600 text-2xl">
              <option value="">-- Chọn vai trò --</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="flex gap-8 pt-10">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8 rounded-2xl text-3xl font-extrabold hover:scale-110 transition shadow-2xl">
                TẠO NGAY
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-600 text-white py-8 rounded-2xl text-3xl font-extrabold hover:scale-110 transition shadow-2xl">
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
