// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const path = require("path");
// const fs = require("fs");

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // ==================== THƯ MỤC UPLOADS ====================
// const uploadsPath = path.join(__dirname, "public", "uploads");
// if (!fs.existsSync(uploadsPath)) {
//   fs.mkdirSync(uploadsPath, { recursive: true });
//   console.log("Thư mục uploads đã được tạo:", uploadsPath);
// }

// app.use("/uploads", express.static(uploadsPath));

// // ==================== MIDDLEWARES ====================
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// // Debug (bật khi cần)
// // app.use((req, res, next) => {
// //   console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
// //   next();
// // });

// // ==================== ROUTES ====================
// // 1. Auth routes
// app.use("/api/auth", require("./routes/auth/auth.route"));

// // 2. TẤT CẢ CÁC ROUTE KHÁC → dùng 1 file index.js duy nhất
// app.use("/api", require("./routes/index.route")); // ← Đây là file routes/index.js

// // ==================== ERROR HANDLER ====================
// app.use((err, req, res, next) => {
//   console.error("Server Error:", err.stack);
//   res.status(err.status || 500).json({
//     error: err.message || "Internal Server Error",
//   });
// });

// // ==================== KẾT NỐI DB & KHỞI ĐỘNG SERVER ====================
// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => {
//     console.log("Connected to MongoDB Atlas");
//     app.listen(PORT, () => {
//       console.log(`\nSERVER ĐÃ SẴN SÀNG!`);
//       console.log(`Local: http://localhost:${PORT}`);
//       console.log(`API:   http://localhost:${PORT}/api\n`);
//     });
//   })
//   .catch((err) => {
//     console.error("MongoDB connection error:", err.message);
//     process.exit(1);
//   });

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== THƯ MỤC UPLOADS ====================
const uploadsPath = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("Thư mục uploads đã được tạo:", uploadsPath);
}

app.use("/uploads", express.static(uploadsPath));

// ==================== MIDDLEWARES ====================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Debug (bật khi cần)
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
//   next();
// });

// ==================== ROUTES ====================
// 1. Auth routes → PHẢI ĐỂ TRƯỚC /api
app.use("/api/auth", require("./routes/auth/auth.route"));

// 2. Tất cả route còn lại → dùng index.route (admin/users, user/me, exam, news, v.v.)
app.use("/api", require("./routes/index.route"));

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ==================== KẾT NỐI DB & KHỞI ĐỘNG SERVER ====================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`\nSERVER ĐÃ SẴN SÀNG!`);
      // console.log(`Local: http://localhost:${PORT}`);
      // console.log(`API:   http://localhost:${PORT}/api`);
      // console.log(`Auth:  http://localhost:${PORT}/api/auth/login`);
      // console.log(`Admin: http://localhost:${PORT}/api/admin/users`);
      // console.log(`User:  http://localhost:${PORT}/api/user/me\n`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
