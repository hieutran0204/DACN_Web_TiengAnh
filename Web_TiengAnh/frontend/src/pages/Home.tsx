// src/pages/Home.tsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-center">
      <h1 className="text-5xl font-bold text-indigo-700 mb-6">
        🌟 English Mastery
      </h1>
      <p className="text-lg text-gray-600 max-w-md mb-8">
        Nền tảng luyện thi TOEIC & học tiếng Anh thông minh với AI — giúp bạn
        học hiệu quả hơn mỗi ngày.
      </p>

      <div className="flex gap-4">
        <Link
          to="/login"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
          Đăng nhập
        </Link>
        <Link
          to="/register"
          className="bg-white border-2 border-indigo-600 text-indigo-700 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition">
          Đăng ký
        </Link>
      </div>
    </div>
  );
}
