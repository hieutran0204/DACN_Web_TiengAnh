// import { useState } from "react";
// import axios from "axios";

// export default function Register() {
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//     name: "",
//     username: "",
//   }); // Thêm username

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // Lấy roleId của role "user" (cần API hoặc hardcode tạm thời)
//       const roleResponse = await axios.get(
//         "http://localhost:3000/api/roles/name/user"
//       );
//       const userRoleId = roleResponse.data.roleId;

//       await axios.post("http://localhost:3000/api/auth/register", {
//         ...form,
//         roleId: userRoleId,
//       });
//       alert("Đăng ký thành công!");
//     } catch (err) {
//       alert("Lỗi: " + (err.response?.data?.message || err.message));
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Đăng ký</h2>
//       <input name="name" placeholder="Tên" onChange={handleChange} />
//       <br />
//       <input
//         name="username"
//         placeholder="Tên đăng nhập"
//         onChange={handleChange}
//       />
//       <br />
//       <input name="email" placeholder="Email" onChange={handleChange} />
//       <br />
//       <input
//         name="password"
//         type="password"
//         placeholder="Mật khẩu"
//         onChange={handleChange}
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

  return (
    <form onSubmit={handleSubmit}>
      <h2>Đăng ký</h2>
      <input
        name="name"
        placeholder="Tên"
        onChange={handleChange}
        value={form.name}
      />
      <br />
      <input
        name="username"
        placeholder="Tên đăng nhập"
        onChange={handleChange}
        value={form.username}
      />
      <br />
      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
        value={form.email}
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
      <button type="submit">Đăng ký</button>
    </form>
  );
}
