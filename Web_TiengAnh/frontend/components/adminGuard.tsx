// components/adminGuard.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert(
        "CẢNH BÁO: Bạn chưa đăng nhập! Chỉ Admin mới được vào khu vực này!"
      );
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.role !== "admin") {
        alert("CẤM VÀO! Chỉ Admin mới được truy cập khu vực quản trị!");
        router.push("/profile"); // hoặc "/home"
        return;
      }

      // Nếu là admin → cho qua
      console.log("ADMIN ĐÃ ĐƯỢC XÁC NHẬN → CHO VÀO!");
    } catch (err) {
      localStorage.removeItem("token");
      alert("Token lỗi! Vui lòng đăng nhập lại.");
      router.push("/login");
    }
  }, [router]);

  // Trong lúc kiểm tra → hiện loading đẹp
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 border-8 border-white border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
        <p className="text-4xl font-extrabold text-white animate-pulse">
          ĐANG KIỂM TRA QUYỀN ADMIN...
        </p>
        <p className="text-xl text-yellow-400 mt-6">Chỉ Admin mới được vào!</p>
      </div>
    </div>
  );
}
