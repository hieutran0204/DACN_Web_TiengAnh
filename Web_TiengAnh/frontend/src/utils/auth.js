import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

/**
 * Custom hook to check if the current user is an admin; redirects to login if not.
 */
export const useAdminCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token || role !== "admin") {
      alert(
        "Bạn không có quyền truy cập! Vui lòng đăng nhập với tài khoản admin."
      );
      localStorage.removeItem("token");
      localStorage.removeItem("roleId");
      localStorage.removeItem("role");
      navigate("/login");
    }
  }, [navigate]);
};

export const logout = async () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const response = await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Lỗi đăng xuất");
      }
      localStorage.removeItem("token");
      localStorage.removeItem("roleId");
      localStorage.removeItem("role");
      window.location.href = "/login"; // Chuyển hướng trực tiếp
      alert("Đăng xuất thành công!");
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  }
};
