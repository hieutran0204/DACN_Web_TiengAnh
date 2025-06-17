// // middlewares/auth.js
// const jwt = require("jsonwebtoken");

// const auth = async (req, res, next) => {
//   try {
//     const token = req.headers["authorization"]?.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ message: "Token không được cung cấp" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded.role) {
//       return res.status(403).json({ message: "Token không chứa vai trò" });
//     }

//     if (decoded.role !== "admin") {
//       return res
//         .status(403)
//         .json({ message: "Cấm: Chỉ admin mới được truy cập" });
//     }

//     req.user = decoded; // Lưu payload vào req.user
//     next();
//   } catch (err) {
//     return res
//       .status(403)
//       .json({ message: "Token không hợp lệ", error: err.message });
//   }
// };

// module.exports = auth;
const jwt = require("jsonwebtoken");
const authService = require("../services/auth/auth.service");

const auth = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token không được cung cấp" });
    }

    // Kiểm tra token có trong danh sách hợp lệ không
    if (!authService.isTokenValid(token)) {
      return res.status(401).json({ message: "Token đã bị vô hiệu hóa" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.role) {
      return res.status(403).json({ message: "Token không chứa vai trò" });
    }

    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Cấm: Chỉ admin mới được truy cập" });
    }

    req.user = decoded; // Lưu payload vào req.user
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Token không hợp lệ", error: err.message });
  }
};

module.exports = auth;
