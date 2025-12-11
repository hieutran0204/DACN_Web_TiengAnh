const jwt = require("jsonwebtoken");
const authService = require("../services/auth/auth.service");

// Middleware kiểm tra token (bắt buộc)
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!authService.isTokenValid(token))
      return res.status(401).json({ message: "Token không hợp lệ" });

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token lỗi", error: err.message });
  }
};

// Middleware kiểm tra quyền admin
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Chỉ admin mới được truy cập" });
    next();
  });
};

// NEW: Middleware xác thực mềm (Có token thì check, lỗi/không có thì thôi -> Guest)
const verifyTokenOptional = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // Nếu token có nhưng không hợp lệ (hết hạn, server restart...) -> coi như guest luôn
    // Thay vì trả lỗi 401, ta chỉ đơn giản là không set req.user
    if (!authService.isTokenValid(token)) {
       req.user = null;
       return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Token lỗi verify -> coi như guest
    req.user = null;
    next();
  }
};

module.exports = { verifyToken, verifyAdmin, verifyTokenOptional };
