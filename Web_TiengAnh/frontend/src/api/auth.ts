// src/api/auth.ts
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("toeic_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("toeic_token");
      toast.error("Phiên hết hạn! Đăng nhập lại");
      setTimeout(() => (window.location.href = "/login"), 1000);
    }
    if (err.response?.status === 403) {
      toast.error("🚫 Bạn không có quyền!");
    }
    throw err;
  }
);

// Types
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  roleId: { name: string };
}

export const register = (data: RegisterData) =>
  api.post("/auth/register", data);
export const login = (data: LoginData) =>
  api.post<{ token: string }>("/auth/login", data);
export const logout = () => api.post("/auth/logout");
export const getUsers = () => api.get<User[]>("/admin/users");
