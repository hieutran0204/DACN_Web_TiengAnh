// // app/admin/users/page.tsx
// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Navbar from "@/components/navbar";
// import Footer from "@/components/footer";
// import { apiFetch } from "@/lib/api";

// export default function UsersPage() {
//   const [users, setUsers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     apiFetch("/admin/users")
//       .then((data) => setUsers(Array.isArray(data) ? data : []))
//       .catch(() => alert("Lỗi tải user"))
//       .finally(() => setLoading(false));
//   }, []);

//   const handleDelete = async (id: string) => {
//     if (!confirm("Xóa thật hả bro?")) return;
//     await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
//     setUsers(users.filter((u) => u._id !== id));
//   };

//   if (loading)
//     return <div className="pt-20 text-center text-2xl">Đang tải user...</div>;

//   return (
//     <main className="min-h-screen bg-background flex flex-col">
//       <Navbar />
//       <div className="flex-1 pt-16">
//         <div className="container mx-auto px-6 py-10">
//           <div className="flex justify-between items-center mb-8">
//             <h1 className="text-5xl font-bold">QUẢN LÝ USER</h1>
//             <button
//               onClick={() => router.push("/admin/users/new")}
//               className="bg-blue-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-blue-700">
//               + THÊM USER
//             </button>
//           </div>

//           <div className="bg-card rounded-xl shadow-2xl overflow-hidden">
//             <table className="w-full">
//               <thead className="bg-muted">
//                 <tr>
//                   <th className="p-4 text-left">Username</th>
//                   <th className="p-4 text-left">Họ tên</th>
//                   <th className="p-4 text-left">Email</th>
//                   <th className="p-4 text-left">Vai trò</th>
//                   <th className="p-4 text-left">Hành động</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {users.map((user) => (
//                   <tr key={user._id} className="border-t hover:bg-muted/50">
//                     <td className="p-4 font-semibold">{user.username}</td>
//                     <td className="p-4">{user.name || "-"}</td>
//                     <td className="p-4">{user.email}</td>
//                     <td className="p-4">
//                       <span
//                         className={`px-3 py-1 rounded-full text-white text-sm font-bold ${
//                           user.roleId?.name === "admin"
//                             ? "bg-red-600"
//                             : user.roleId?.name === "editor"
//                               ? "bg-yellow-600"
//                               : "bg-green-600"
//                         }`}>
//                         {user.roleId?.name?.toUpperCase() || "USER"}
//                       </span>
//                     </td>
//                     <td className="p-4">
//                       <button
//                         onClick={() =>
//                           router.push(`/admin/users/${user._id}/edit`)
//                         }
//                         className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
//                         Sửa
//                       </button>
//                       <button
//                         onClick={() => handleDelete(user._id)}
//                         className="bg-red-600 text-white px-4 py-2 rounded">
//                         Xóa
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </main>
//   );
// }

// app/admin/users/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { apiFetch } from "@/lib/api";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // BẢO VỆ CHỈ ADMIN MỚI VÀO
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert(
        "CẢNH BÁO: Bạn chưa đăng nhập! Chỉ Admin mới vào được khu vực này!"
      );
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "admin") {
        alert("CẤM VÀO! Chỉ Admin mới được truy cập khu vực quản trị!");
        router.push("/profile");
        return;
      }
      setCheckingAuth(false);
    } catch {
      localStorage.removeItem("token");
      alert("Token lỗi! Đăng nhập lại ngay!");
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!checkingAuth) {
      apiFetch("/admin/users")
        .then((data) => setUsers(Array.isArray(data) ? data : []))
        .catch(() => alert("Lỗi tải danh sách user"))
        .finally(() => setLoading(false));
    }
  }, [checkingAuth]);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa thật hả bro?")) return;
    await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
    setUsers(users.filter((u) => u._id !== id));
  };

  // HIỆN LOADING ĐẸP KHI ĐANG KIỂM TRA QUYỀN
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 border-8 border-white border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
          <p className="text-5xl font-extrabold text-white animate-pulse">
            ĐANG KIỂM TRA QUYỀN ADMIN...
          </p>
          <p className="text-2xl text-yellow-400 mt-6">
            Chỉ Admin mới được vào!
          </p>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="pt-20 text-center text-4xl font-bold text-purple-600">
        Đang tải danh sách user...
      </div>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="container mx-auto px-6 py-10">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              QUẢN LÝ USER
            </h1>
            <button
              onClick={() => router.push("/admin/users/new")}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-6 rounded-2xl text-2xl font-extrabold hover:scale-110 transition shadow-2xl">
              + THÊM USER MỚI
            </button>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-3xl overflow-hidden border border-purple-200">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <tr>
                  <th className="p-6 text-left text-xl">Username</th>
                  <th className="p-6 text-left text-xl">Họ tên</th>
                  <th className="p-6 text-left text-xl">Email</th>
                  <th className="p-6 text-left text-xl">Vai trò</th>
                  <th className="p-6 text-left text-xl">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t hover:bg-purple-50 transition">
                    <td className="p-6 font-bold text-lg">{user.username}</td>
                    <td className="p-6">{user.name || "-"}</td>
                    <td className="p-6">{user.email}</td>
                    <td className="p-6">
                      <span
                        className={`px-6 py-3 rounded-full text-white font-extrabold text-lg shadow-lg ${
                          user.roleId?.name === "admin"
                            ? "bg-red-600"
                            : user.roleId?.name === "editor"
                              ? "bg-orange-600"
                              : "bg-emerald-600"
                        }`}>
                        {user.roleId?.name?.toUpperCase() || "USER"}
                      </span>
                    </td>
                    <td className="p-6 space-x-4">
                      <button
                        onClick={() =>
                          router.push(`/admin/users/${user._id}/edit`)
                        }
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:scale-110 transition shadow-lg">
                        SỬA
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:scale-110 transition shadow-lg">
                        XÓA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
