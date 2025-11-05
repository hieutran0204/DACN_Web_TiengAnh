// import { useState } from "react";
// import { login, type LoginData } from "../api/auth";
// import toast from "react-hot-toast";
// import { Link, useNavigate } from "react-router-dom";

// export default function Login() {
//   const [form, setForm] = useState<LoginData>({ username: "", password: "" });
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     try {
//       await toast.promise(login(form), {
//         loading: "Đang đăng nhập...",
//         success: (res) => {
//           localStorage.setItem("toeic_token", res.data.token);

//           // Giải mã token để kiểm tra role
//           const token = res.data.token;
//           const payload = JSON.parse(atob(token.split(".")[1])); // decode phần payload
//           const role = payload.role;

//           if (role === "admin") {
//             navigate("/dashboard"); // ✅ admin → dashboard
//           } else {
//             navigate("/"); // 👈 user thường → về home
//           }

//           return `Chào mừng ${role === "admin" ? "quản trị viên" : "bạn"} quay lại!`;
//         },
//         error: (err: unknown) => {
//           if (err instanceof Error && "response" in err) {
//             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//             const axiosErr = err as any;
//             return axiosErr.response?.data?.error || "Sai tài khoản/mật khẩu";
//           }
//           return "Đã xảy ra lỗi không xác định";
//         },
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded-xl shadow-2xl w-96">
//         <h2 className="text-3xl font-bold text-center mb-8 text-teal-700">
//           Đăng Nhập TOEIC
//         </h2>

//         <input
//           type="text"
//           placeholder="Tên đăng nhập"
//           className="w-full p-4 mb-4 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
//           required
//           value={form.username}
//           onChange={(e) => setForm({ ...form, username: e.target.value })}
//         />

//         <input
//           type="password"
//           placeholder="Mật khẩu"
//           className="w-full p-4 mb-6 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
//           required
//           value={form.password}
//           onChange={(e) => setForm({ ...form, password: e.target.value })}
//         />

//         <button
//           type="submit"
//           className="w-full bg-teal-600 text-white p-4 rounded-lg font-bold hover:bg-teal-700 transition">
//           Đăng Nhập Ngay
//         </button>

//         <p className="mt-6 text-center text-gray-600">
//           Chưa có tài khoản?{" "}
//           <Link
//             to="/register"
//             className="text-teal-600 font-bold hover:underline">
//             Đăng ký miễn phí
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// }
import { useState } from "react";
import { login, type LoginData } from "../api/auth";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState<LoginData>({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await toast.promise(login(form), {
        loading: "Đang đăng nhập...",
        success: (res) => {
          const token = res.data.token;
          localStorage.setItem("toeic_token", token);

          // 👇 Decode token an toàn hơn
          let role = "";
          try {
            const base64Payload = token.split(".")[1];
            const payload = JSON.parse(atob(base64Payload));
            role = payload.role || "";
          } catch (err) {
            console.warn("Không thể decode token:", err);
          }

          // 👇 Điều hướng dựa trên role
          if (role === "admin") {
            navigate("/dashboard");
            return "Chào mừng Quản trị viên quay lại!";
          } else {
            navigate("/"); // 🏠 user thường → trang chủ
            return "Đăng nhập thành công!";
          }
        },
        error: (err: unknown) => {
          if (err instanceof Error && "response" in err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const axiosErr = err as any;
            return axiosErr.response?.data?.error || "Sai tài khoản/mật khẩu";
          }
          return "Đã xảy ra lỗi không xác định";
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-2xl w-96">
        <h2 className="text-3xl font-bold text-center mb-8 text-teal-700">
          Đăng Nhập TOEIC
        </h2>

        <input
          type="text"
          placeholder="Tên đăng nhập"
          className="w-full p-4 mb-4 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
          required
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full p-4 mb-6 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="submit"
          className="w-full bg-teal-600 text-white p-4 rounded-lg font-bold hover:bg-teal-700 transition">
          Đăng Nhập Ngay
        </button>

        <p className="mt-6 text-center text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-teal-600 font-bold hover:underline">
            Đăng ký miễn phí
          </Link>
        </p>
      </form>
    </div>
  );
}
