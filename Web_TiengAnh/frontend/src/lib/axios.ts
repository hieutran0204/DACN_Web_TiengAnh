// src/lib/axios.ts   ← CHỈ 1 FILE DUY-NHẤT
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 8000,
});

// 1. TỰ ĐỘNG GẮN TOKEN
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 2. TỰ ĐỘNG LOGOUT + TOAST KHI LỖI PHÂN QUYỀN
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error || err.message;

    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      toast.error("Phiên hết hạn – Đăng nhập lại!");
      setTimeout(() => (window.location.href = "/login"), 1500);
    }

    if (err.response?.status === 403) {
      toast.error("🚫 " + (msg.includes("Cấm") ? msg : "Bạn không có quyền!"));
    }

    return Promise.reject(err);
  }
);

export default api;
