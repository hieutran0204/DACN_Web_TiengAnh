
const express = require("express");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs").promises;
require("dotenv").config();

// Module cục bộ
const database = require("./config/database");

// Khởi tạo app và server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 10000;

// Middleware
app.use(methodOverride("_method"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
app.use("/shared", express.static(path.join(__dirname, "public/shared")));
app.use("/admin", express.static(path.join(__dirname, "public/admin")));
app.use("/client", express.static(path.join(__dirname, "public/client")));

// Session
app.use(
  session({
    secret: process.env.JWT_SECRET || "default-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// View engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Kết nối DB
database.connectDB();

// Socket.io với xác thực JWT
const jwt = require("jsonwebtoken");
const User = require("./models/shared/user.model");
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log("Socket auth error: No token provided");
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default-secret"
    );
    socket.user = await User.findById(decoded.id).select(
      "-password -refreshToken"
    );
    if (!socket.user) {
      console.log("Socket auth error: User not found");
      return next(new Error("User not found"));
    }
    // Tạo channelID cố định: client_fullname_username
    socket.channelID = `client_${socket.user.fullname.replace(/[^a-zA-Z0-9]/g, "_")}_${socket.user.username}`;
    console.log(
      `Socket auth success: ${socket.user.username} - Channel: ${socket.channelID}`
    );
    next();
  } catch (error) {
    console.log("Socket auth error:", error.message);
    next(new Error("Invalid token"));
  }
});

// Xử lý Socket.io
const Message = require("./models/shared/message.model");
io.on("connection", (socket) => {
  console.log(
    `User connected: ${socket.user.username} (${socket.user.role}) - Channel: ${socket.channelID}`
  );

  // Client tự động tham gia phòng của mình
  socket.join(socket.channelID);

  // Gửi danh sách client đang online cho admin
  if (socket.user.role === "admin") {
    User.find({ role: "user" })
      .select("fullname username")
      .then((users) => {
        socket.emit(
          "clientList",
          users.map((user) => ({
            channelID: `client_${user.fullname.replace(/[^a-zA-Z0-9]/g, "_")}_${user.username}`,
            fullname: user.fullname,
            username: user.username,
          }))
        );
      });
  }

  // Admin tham gia phòng của client
  socket.on("joinChannel", (channelID) => {
    if (socket.user.role === "admin") {
      socket.join(channelID);
      console.log(`Admin ${socket.user.username} joined ${channelID}`);
    }
  });

  // Gửi tin nhắn hoặc ảnh
  socket.on("sendMessage", async (data) => {
    console.log("Received message:", data);
    const { content, type, channelID } = data;
    if (!content || !channelID) {
      console.log("Invalid message data:", data);
      return;
    }
    let savedContent = content;

    // Xử lý ảnh base64
    if (type === "image" && content.startsWith("data:image")) {
      const base64Data = content.replace(/^data:image\/\w+;base64,/, "");
      const filename = `${Date.now()}.png`;
      const filePath = path.join(__dirname, "public/uploads", filename);
      try {
        await fs.writeFile(filePath, base64Data, "base64");
        savedContent = `/uploads/${filename}`;
      } catch (error) {
        console.log("Error saving image:", error);
        return;
      }
    }

    const message = new Message({
      userId: socket.user._id,
      username: socket.user.username,
      content: savedContent,
      type: type || "text",
      role: socket.user.role,
      channelID,
    });
    try {
      await message.save();
      console.log("Message saved:", message);
      io.to(channelID).emit("receiveMessage", message);
    } catch (error) {
      console.log("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.username}`);
  });
});

// API lấy lịch sử chat theo channelID
app.get("/chat/history/:channelID", async (req, res) => {
  try {
    const messages = await Message.find({ channelID: req.params.channelID })
      .sort({ timestamp: 1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    console.log("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Routes
const authRoutes = require("./routes/shared/auth.route.js");
const questionRoutes = require("./routes/admin/CRUD_readingTOEIC.route.js");
const clientRoutes = require("./routes/client/index.route");
const adminRoutes = require("./routes/admin/index.route");
const listeningRoutes = require("./routes/admin/CRUD_listeningTOEIC.route.js");
const newsRoutes = require("./routes/client/news.route.js");
const adminTOEIC = require("./routes/admin/TOEIC.route.js");
const testTOEIC = require("./routes/client/toeic.route.js");
const wordGameRoutes = require("./routes/client/wordgame.route.js");
const wordGameAdminRoutes = require("./routes/admin/wordgame.route.js");
const hiddenWordAdminRoutes = require("./routes/admin/hiddenWord.route.js");
const hiddenWordRoutes = require("./routes/client/hiddenWord.route.js");
const speakingRoutes = require("./routes/client/speaking.route.js");
const speakingAdminRoutes = require("./routes/admin/speaking.route.js");
const transcriptionAdminRoutes = require("./routes/admin/transcription.route.js");
const transcriptionRoutes = require("./routes/client/transcription.route.js");
const writingAdminRoutes = require("./routes/admin/CRUD_writingTOEIC.route.js");
const manageUserRoutes = require("./routes/admin/users.route.js");
const chatRoutes = require("./routes/shared/chat.route.js");
app.use("/auth", authRoutes);
app.use("/", authRoutes);
app.use("/", clientRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/questions", questionRoutes);
app.use("/admin/listeningTOEIC", listeningRoutes);
app.use("/news", newsRoutes);
app.use("/admin/TOEIC", adminTOEIC);
app.use("/testtoeic", testTOEIC);
app.use("/wordgame", wordGameRoutes);
app.use("/admin/wordgame", wordGameAdminRoutes);
app.use("/admin/hidden-word", hiddenWordAdminRoutes);
app.use("/hidden-word", hiddenWordRoutes);
app.use("/speaking", speakingRoutes);
app.use("/admin/speaking", speakingAdminRoutes);
app.use("/admin/transcription", transcriptionAdminRoutes);
app.use("/transcription", transcriptionRoutes);
app.use("/admin/toeic-writing", writingAdminRoutes);
app.use("/admin/users", manageUserRoutes);
app.use("/", chatRoutes);

// Khởi động server
server.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
