// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const path = require("path");
// const authService = require("./services/auth/auth.service");

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3000;
// const uploadsPath = path.join(__dirname, "public/uploads"); // Trỏ từ backend đến public
// console.log("Static path configured:", uploadsPath);
// app.use(
//   "/uploads",
//   express.static(uploadsPath, {
//     setHeaders: (res) => {
//       res.set("Access-Control-Allow-Origin", "*");
//     },
//   })
// );
// app.use(express.json());
// app.use(cors());
// app.use((req, res, next) => {
//   console.log("Debug - Request Body:", req.body);
//   next();
// });

// // Các route khác giữ nguyên
// const authRoutes = require("./routes/auth/auth.route");
// app.use("/api/auth", authRoutes);
// const listeningRoute = require("./routes/listening/listeningQuestion.route");
// app.use("/api", listeningRoute); // Thay vì "/api/listening-questions"
// const partRoute = require("./routes/part.route");
// app.use("/api/parts", partRoute);
// const skillRoute = require("./routes/skill.route");
// app.use("/api/skills", skillRoute);
// const readingRoute = require("./routes/reading/readingQuestion.route");
// app.use("/api/reading-questions", readingRoute);
// app.use((err, req, res, next) => {
//   console.error("Server Error:", err.stack);
//   res.status(500).json({ error: "Đã xảy ra lỗi server", message: err.message });
// });

// const server = mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => {
//     console.log("✅ Connected to MongoDB Atlas");
//     const server = app.listen(PORT, () =>
//       console.log(`🚀 Server is running at http://localhost:${PORT}`)
//     );

//     process.on("SIGINT", () => {
//       console.log("🛑 Server is shutting down...");
//       authService.clearAllTokens();
//       server.close(() => {
//         console.log("✅ Server stopped.");
//         mongoose.connection.close(false, () => {
//           console.log("✅ MongoDB connection closed.");
//           process.exit(0);
//         });
//       });
//     });
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB connection error:", err);
//     process.exit(1);
//   });
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs"); // Thêm fs
const authService = require("./services/auth/auth.service");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const uploadsPath = path.join(__dirname, "public/uploads");

// Tự động tạo thư mục nếu chưa có
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📁 Thư mục uploads đã được tạo.");
}
console.log("Static path configured:", uploadsPath);

// Phục vụ file tĩnh
app.use(
  "/uploads",
  express.static(uploadsPath, {
    setHeaders: (res) => {
      res.set("Access-Control-Allow-Origin", "*");
    },
  })
);

// Middleware
app.use(express.json());

// Cấu hình CORS chính xác hơn
app.use(
  cors({
    origin: "http://localhost:5173", // Chỉ frontend mới được gọi
    credentials: true,
  })
);

// Debug request body
app.use((req, res, next) => {
  console.log("Debug - Request Body:", req.body);
  next();
});

// Routes
const authRoutes = require("./routes/auth/auth.route");
app.use("/api/auth", authRoutes);

const listeningRoute = require("./routes/listening/listeningQuestion.route");
app.use("/api", listeningRoute);

const partRoute = require("./routes/part.route");
app.use("/api/parts", partRoute);

const skillRoute = require("./routes/skill.route");
app.use("/api/skills", skillRoute);

const readingRoute = require("./routes/reading/readingQuestion.route");
app.use("/api/reading-questions", readingRoute);

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Kết nối DB + Khởi động server
const server = mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    const server = app.listen(PORT, () =>
      console.log(`🚀 Server is running at http://localhost:${PORT}`)
    );

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log("🛑 Server is shutting down...");
      authService.clearAllTokens();
      server.close(() => {
        console.log("✅ Server stopped.");
        mongoose.connection.close(false, () => {
          console.log("✅ MongoDB connection closed.");
          process.exit(0);
        });
      });
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
