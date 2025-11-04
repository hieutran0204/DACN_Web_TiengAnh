// // import { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import axios from "axios";

// // export default function Login() {
// //   const [form, setForm] = useState({ username: "", password: "" });
// //   const navigate = useNavigate();

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setForm((prev) => ({ ...prev, [name]: value }));
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       const res = await axios.post(
// //         "http://localhost:3000/api/auth/login",
// //         form
// //       );
// //       const { token } = res.data;

// //       // Lưu token vào localStorage
// //       localStorage.setItem("token", token);

// //       // Giải mã token để lấy roleId và role
// //       const decoded = JSON.parse(atob(token.split(".")[1]));
// //       localStorage.setItem("roleId", decoded.roleId);
// //       localStorage.setItem("role", decoded.role);

// //       // Chuyển hướng dựa trên role
// //       if (decoded.role === "user") {
// //         navigate("/exams"); // Cập nhật từ /listExam thành /exams
// //       } else {
// //         navigate("/listening");
// //       }
// //       alert("Đăng nhập thành công!");
// //     } catch (err) {
// //       alert("Lỗi: " + (err.response?.data?.error || err.message));
// //     }
// //   };

// //   return (
// //     <div style={{ padding: 20, maxWidth: 400, margin: "0 auto" }}>
// //       <h2>Đăng nhập</h2>
// //       <form onSubmit={handleSubmit}>
// //         <input
// //           name="username"
// //           placeholder="Tên đăng nhập"
// //           onChange={handleChange}
// //           value={form.username}
// //         />
// //         <br />
// //         <input
// //           name="password"
// //           type="password"
// //           placeholder="Mật khẩu"
// //           onChange={handleChange}
// //           value={form.password}
// //         />
// //         <br />
// //         <button type="submit">Đăng nhập</button>
// //       </form>
// //     </div>
// //   );
// // }
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// export default function Login() {
//   const [form, setForm] = useState({ username: "", password: "" });
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post(
//         "http://localhost:3000/api/auth/login",
//         form
//       );
//       const { token } = res.data;

//       localStorage.setItem("token", token);
//       const decoded = JSON.parse(atob(token.split(".")[1]));
//       localStorage.setItem("roleId", decoded.roleId);
//       localStorage.setItem("role", decoded.role);

//       if (decoded.role === "user") {
//         navigate("/exams");
//       } else {
//         navigate("/listening");
//       }
//       alert("Đăng nhập thành công!");
//     } catch (err) {
//       alert("Lỗi: " + (err.response?.data?.error || err.message));
//     }
//   };

//   return (
//     <div
//       style={{
//         width: "100vw",
//         height: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "#eef2f5",
//       }}>
//       <div
//         style={{
//           padding: 40,
//           width: "100%",
//           maxWidth: 400,
//           border: "1px solid #ccc",
//           borderRadius: 10,
//           boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//           backgroundColor: "#fff",
//           fontFamily: "Arial, sans-serif",
//         }}>
//         <h2 style={{ textAlign: "center", marginBottom: 30 }}>Đăng nhập</h2>
//         <form onSubmit={handleSubmit}>
//           <input
//             name="username"
//             placeholder="Tên đăng nhập"
//             onChange={handleChange}
//             value={form.username}
//             style={{
//               width: "100%",
//               padding: "10px 12px",
//               marginBottom: 20,
//               borderRadius: 6,
//               border: "1px solid #ccc",
//               fontSize: 16,
//             }}
//           />
//           <input
//             name="password"
//             type="password"
//             placeholder="Mật khẩu"
//             onChange={handleChange}
//             value={form.password}
//             style={{
//               width: "100%",
//               padding: "10px 12px",
//               marginBottom: 20,
//               borderRadius: 6,
//               border: "1px solid #ccc",
//               fontSize: 16,
//             }}
//           />
//           <button
//             type="submit"
//             style={{
//               width: "100%",
//               padding: "12px",
//               backgroundColor: "#4CAF50",
//               color: "white",
//               border: "none",
//               borderRadius: 6,
//               fontSize: 16,
//               cursor: "pointer",
//             }}>
//             Đăng nhập
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/login",
        form
      );
      const { token } = res.data;

      localStorage.setItem("token", token);
      const decoded = JSON.parse(atob(token.split(".")[1]));
      localStorage.setItem("roleId", decoded.roleId);
      localStorage.setItem("role", decoded.role);

      if (decoded.role === "user") {
        navigate("/exams");
      } else {
        navigate("/listening");
      }
      alert("Đăng nhập thành công!");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.error || err.message));
    }
  };

  const handleRegister = () => {
    navigate("/register"); // đường dẫn đến trang đăng ký
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#eef2f5",
      }}>
      <div
        style={{
          padding: 40,
          width: "100%",
          maxWidth: 400,
          border: "1px solid #ccc",
          borderRadius: 10,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#fff",
          fontFamily: "Arial, sans-serif",
        }}>
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Tên đăng nhập"
            onChange={handleChange}
            value={form.username}
            style={{
              width: "100%",
              padding: "10px 12px",
              marginBottom: 20,
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
          />
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu"
            onChange={handleChange}
            value={form.password}
            style={{
              width: "100%",
              padding: "10px 12px",
              marginBottom: 20,
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: 6,
                fontSize: 16,
                cursor: "pointer",
              }}>
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={handleRegister}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: 6,
                fontSize: 16,
                cursor: "pointer",
              }}>
              Đăng ký
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
