// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { getUsers, logout, type User } from "../api/auth";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers()
      .then((res) => setUsers(res.data))
      .catch(() => toast.error("Chỉ Admin mới xem được!"));
  }, []);

  const handleLogout = () => {
    logout().finally(() => {
      localStorage.removeItem("toeic_token");
      window.location.href = "/login";
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-700">
            TOEIC Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition">
            Đăng xuất
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Danh sách người dùng (Admin only)
          </h2>
          <div className="grid gap-4">
            {users.map((u) => (
              <div
                key={u._id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-bold text-indigo-600">{u.username}</span>{" "}
                • {u.email} •{" "}
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    u.roleId.name === "admin"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                  {u.roleId.name.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
