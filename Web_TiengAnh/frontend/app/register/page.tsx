"use client";

import { useState } from "react";

// Component chứa CSS được nhúng trực tiếp
const GlobalStyles = () => (
  <style jsx global>{`
    .pageContainer {
      height: 100vh;
      /* Cập nhật ảnh nền để phù hợp hơn với ví dụ nếu có */
      background-image: url('/pxfuel.jpg');
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
    }
    * {
      box-sizing: border-box;
    }
  `}</style>
);


export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Đăng ký thất bại");

      alert("Đăng ký thành công!");
      window.location.href = "/login";

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pageContainer">
      <GlobalStyles />
    
      <div className="flex min-h-screen items-center justify-center px-4">
        {/* SỬA ĐỔI: Áp dụng hiệu ứng glassmorphism */}
        <div 
          className="w-full max-w-md p-8 rounded-2xl border border-solid border-white border-opacity-30" 
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', // Nền trắng trong suốt hơn
            backdropFilter: 'blur(10px)', // Hiệu ứng mờ nền
            WebkitBackdropFilter: 'blur(10px)', // Hỗ trợ Safari
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' // Đổ bóng nhẹ
          }}
        >
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
              T
            </div>
            <h1 className="text-2xl font-semibold mt-4 text-gray-800">
              Đăng ký tài khoản
            </h1>
            <p className="text-gray-500 text-sm">
              Tham gia TestKiller ngay để nâng cao kỹ năng tiếng Anh của bạn!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên tài khoản
              </label>
              <input
                type="username"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Abc123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-lg hover:bg-green-700 transition-colors">
              {loading ? "Signing up..." : "Đăng ký"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Đã có tài khoản?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Đăng nhập ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}