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

//       // Lưu token vào localStorage
//       localStorage.setItem("token", token);

//       // Giải mã token để lấy roleId (hoặc gọi API lấy thông tin user)
//       const decoded = JSON.parse(atob(token.split(".")[1]));
//       localStorage.setItem("roleId", decoded.roleId);

//       // Chuyển hướng đến /listening
//       navigate("/listening");
//       alert("Đăng nhập thành công!");
//     } catch (err) {
//       alert("Lỗi: " + (err.response?.data?.message || err.message));
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Đăng nhập</h2>
//       <input
//         name="username"
//         placeholder="Tên đăng nhập"
//         onChange={handleChange}
//       />
//       <br />
//       <input
//         name="password"
//         type="password"
//         placeholder="Mật khẩu"
//         onChange={handleChange}
//       />
//       <br />
//       <button type="submit">Đăng nhập</button>
//     </form>
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

      // Lưu token vào localStorage
      localStorage.setItem("token", token);

      // Giải mã token để lấy roleId và role
      const decoded = JSON.parse(atob(token.split(".")[1]));
      localStorage.setItem("roleId", decoded.roleId);
      localStorage.setItem("role", decoded.role);

      // Chuyển hướng đến /listening
      navigate("/listening");
      alert("Đăng nhập thành công!");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "0 auto" }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Tên đăng nhập"
          onChange={handleChange}
          value={form.username}
        />
        <br />
        <input
          name="password"
          type="password"
          placeholder="Mật khẩu"
          onChange={handleChange}
          value={form.password}
        />
        <br />
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
}
