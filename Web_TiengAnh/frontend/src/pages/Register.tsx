// // src/pages/Register.tsx
// import { useState } from "react";
// import { register, type RegisterData } from "../api/auth";
// import toast from "react-hot-toast";
// import { Link, useNavigate } from "react-router-dom";

// export default function Register() {
//   const [form, setForm] = useState<RegisterData>({
//     username: "",
//     email: "",
//     password: "",
//     name: "",
//   });
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await toast.promise(register(form), {
//       loading: "Đang tạo tài khoản...",
//       success: () => {
//         navigate("/login");
//         return "Đăng ký thành công! Đăng nhập ngay!";
//       },
//       error: (err: any) => err.response?.data?.error || "Lỗi server",
//     });
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded-xl shadow-2xl w-96">
//         <h2 className="text-3xl font-bold text-center mb-8 text-indigo-700">
//           Đăng Ký TOEIC
//         </h2>
//         {(["username", "name", "email", "password"] as const).map((field) => (
//           <input
//             key={field}
//             type={
//               field === "password"
//                 ? "password"
//                 : field === "email"
//                   ? "email"
//                   : "text"
//             }
//             placeholder={
//               field === "name"
//                 ? "Họ và tên"
//                 : field === "username"
//                   ? "Tên đăng nhập"
//                   : field === "email"
//                     ? "Email"
//                     : "Mật khẩu (6+ ký tự)"
//             }
//             className="w-full p-4 mb-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
//             required
//             value={form[field]}
//             onChange={(e) => setForm({ ...form, [field]: e.target.value })}
//           />
//         ))}
//         <button className="w-full bg-indigo-600 text-white p-4 rounded-lg font-bold hover:bg-indigo-700 transition">
//           Tạo Tài Khoản
//         </button>
//         <p className="mt-6 text-center text-gray-600">
//           Đã có tài khoản?{" "}
//           <Link
//             to="/login"
//             className="text-indigo-600 font-bold hover:underline">
//             Đăng nhập ngay
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// }
import { useState } from "react";
import { register, type RegisterData } from "../api/auth";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    name: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await toast.promise(register(form), {
        loading: "Đang tạo tài khoản...",
        success: () => {
          navigate("/login");
          return "Đăng ký thành công! Đăng nhập ngay!";
        },
        error: (err: unknown) => {
          if (err instanceof Error && "response" in err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const axiosErr = err as any;
            return axiosErr.response?.data?.error || "Lỗi server";
          }
          return "Đã xảy ra lỗi không xác định";
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const fields: (keyof RegisterData)[] = [
    "username",
    "name",
    "email",
    "password",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-2xl w-96">
        <h2 className="text-3xl font-bold text-center mb-8 text-indigo-700">
          Đăng Ký TOEIC
        </h2>

        {fields.map((field) => (
          <input
            key={field}
            type={
              field === "password"
                ? "password"
                : field === "email"
                  ? "email"
                  : "text"
            }
            placeholder={
              field === "name"
                ? "Họ và tên"
                : field === "username"
                  ? "Tên đăng nhập"
                  : field === "email"
                    ? "Email"
                    : "Mật khẩu (6+ ký tự)"
            }
            className="w-full p-4 mb-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
            required
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          />
        ))}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white p-4 rounded-lg font-bold hover:bg-indigo-700 transition">
          Tạo Tài Khoản
        </button>

        <p className="mt-6 text-center text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </form>
    </div>
  );
}
