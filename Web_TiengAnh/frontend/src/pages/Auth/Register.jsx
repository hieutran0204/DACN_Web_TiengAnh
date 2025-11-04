// // import { useState } from "react";
// // import axios from "axios";

// // export default function Register() {
// //   const [form, setForm] = useState({
// //     email: "",
// //     password: "",
// //     name: "",
// //     username: "",
// //   }); // Thêm username

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setForm((prev) => ({ ...prev, [name]: value }));
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       // Lấy roleId của role "user" (cần API hoặc hardcode tạm thời)
// //       const roleResponse = await axios.get(
// //         "http://localhost:3000/api/roles/name/user"
// //       );
// //       const userRoleId = roleResponse.data.roleId;

// //       await axios.post("http://localhost:3000/api/auth/register", {
// //         ...form,
// //         roleId: userRoleId,
// //       });
// //       alert("Đăng ký thành công!");
// //     } catch (err) {
// //       alert("Lỗi: " + (err.response?.data?.message || err.message));
// //     }
// //   };

// //   return (
// //     <form onSubmit={handleSubmit}>
// //       <h2>Đăng ký</h2>
// //       <input name="name" placeholder="Tên" onChange={handleChange} />
// //       <br />
// //       <input
// //         name="username"
// //         placeholder="Tên đăng nhập"
// //         onChange={handleChange}
// //       />
// //       <br />
// //       <input name="email" placeholder="Email" onChange={handleChange} />
// //       <br />
// //       <input
// //         name="password"
// //         type="password"
// //         placeholder="Mật khẩu"
// //         onChange={handleChange}
// //       />
// //       <br />
// //       <button type="submit">Đăng ký</button>
// //     </form>
// //   );
// // }
// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function Register() {
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//     name: "",
//     username: "",
//   });
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post("http://localhost:3000/api/auth/register", form);
//       alert("Đăng ký thành công! Vui lòng đăng nhập.");
//       navigate("/login");
//     } catch (err) {
//       alert("Lỗi: " + (err.response?.data?.error || err.message));
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Đăng ký</h2>
//       <input
//         name="name"
//         placeholder="Tên"
//         onChange={handleChange}
//         value={form.name}
//       />
//       <br />
//       <input
//         name="username"
//         placeholder="Tên đăng nhập"
//         onChange={handleChange}
//         value={form.username}
//       />
//       <br />
//       <input
//         name="email"
//         placeholder="Email"
//         onChange={handleChange}
//         value={form.email}
//       />
//       <br />
//       <input
//         name="password"
//         type="password"
//         placeholder="Mật khẩu"
//         onChange={handleChange}
//         value={form.password}
//       />
//       <br />
//       <button type="submit">Đăng ký</button>
//     </form>
//   );
// }
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/auth/register", form);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.error || err.message));
    }
  };

  const goToLogin = () => {
    navigate("/login");
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
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>Đăng ký</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Tên"
            onChange={handleChange}
            value={form.name}
            style={inputStyle}
          />
          <input
            name="username"
            placeholder="Tên đăng nhập"
            onChange={handleChange}
            value={form.username}
            style={inputStyle}
          />
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={form.email}
            style={inputStyle}
          />
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu"
            onChange={handleChange}
            value={form.password}
            style={inputStyle}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="submit"
              style={buttonStyle("#4CAF50")} // màu xanh lá
            >
              Đăng ký
            </button>
            <button
              type="button"
              onClick={goToLogin}
              style={buttonStyle("#2196F3")} // màu xanh dương
            >
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Styles tái sử dụng
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginBottom: 20,
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: 16,
};

const buttonStyle = (bgColor) => ({
  flex: 1,
  padding: "12px",
  backgroundColor: bgColor,
  color: "white",
  border: "none",
  borderRadius: 6,
  fontSize: 16,
  cursor: "pointer",
});
