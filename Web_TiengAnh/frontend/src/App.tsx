import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";

// 🔐 Component bảo vệ route (chỉ admin mới được vào)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("toeic_token");

  // Nếu chưa đăng nhập → quay lại login
  if (!token) return <Navigate to="/login" />;

  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload || ""));
    const role = payload?.role;

    // Nếu không phải admin → quay về trang chủ
    if (role !== "admin") {
      return <Navigate to="/" />;
    }
  } catch (err) {
    console.warn("Lỗi khi decode token:", err);
    return <Navigate to="/login" />;
  }

  // Nếu hợp lệ → cho vào trang admin
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌍 PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔐 PRIVATE ROUTES (ADMIN ONLY) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 🚧 CATCH-ALL */}
        <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
      </Routes>
    </BrowserRouter>
  );
}
