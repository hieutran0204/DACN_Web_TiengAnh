// const router = require("express").Router();

// // === USER ROUTES – PHẢI ĐẶT TRƯỚC ADMIN ===
// router.use("/user", require("./user/profile.route")); // ← /user/me, /user/me PUT
// router.use("/exam", require("./user/exam/exam.route"));
// router.use("/listening", require("./user/listening/listening.route"));
// router.use("/reading", require("./user/reading/reading.route"));
// router.use("/speaking", require("./user/speaking/speaking.route"));
// router.use("/writing", require("./user/writing/writing.route"));
// router.use("/skills", require("./user/skill.route"));
// router.use("/news", require("./user/news/news.route"));

// // === ADMIN ROUTES – ĐẶT SAU ĐỂ TRÁNH ĐÈ /user ===
// // ADMIN USER – CHI TIẾT
// router.get("/admin/users/roles", require("./admin/user.route"));
// router.get("/admin/users", require("./admin/user.route"));
// router.post("/admin/users", require("./admin/user.route"));
// router.use("/admin/users/:id", require("./admin/user.route"));
// router.use("/admin/users", require("./admin/user.route"));

// // ADMIN KHÁC
// router.use("/admin/questions", require("./admin/question/question.route"));
// router.use("/admin/exam", require("./admin/exam/exam.route"));
// router.use("/admin/part", require("./admin/part.route"));
// router.use("/admin/news", require("./admin/news/news.route"));

// module.exports = router;

// routes/index.route.js
const router = require("express").Router();

// ======================= PUBLIC EXAMS (ai cũng vào làm được) =======================
router.use("/exam", require("./exam.route")); // ← ĐÃ SỬA: chỉ public

// ======================= USER ROUTES (đã login) =======================
router.use("/user/exam", require("./user/exam/exam.route")); // ← lịch sử làm bài sau này
router.use("/user", require("./user/profile.route"));
router.use("/user/skills", require("./user/skill.route"));

// ======================= ADMIN ROUTES =======================
router.use("/admin/exam", require("./admin/exam/exam.route")); // ← QUẢN LÝ ĐỀ
router.use("/admin/questions", require("./admin/question/question.route"));
router.use("/admin/news", require("./admin/news/news.route"));
router.use("/admin/part", require("./admin/part.route"));

// Admin quản lý user (giữ nguyên như bạn đang có)
// router.use("/admin/users", require("./admin/user.route"));

// ======================= AUTH =======================
router.use("/auth", require("./auth/auth.route"));
router.get("/admin/users/roles", require("./admin/user.route"));
router.get("/admin/users", require("./admin/user.route"));
router.post("/admin/users", require("./admin/user.route"));
router.use("/admin/users/:id", require("./admin/user.route"));
router.use("/admin/users", require("./admin/user.route"));
// ======================= CÁC ROUTE KHÁC (nếu có) =======================
// router.use("/news", require("./news.route"));
// router.use("/listening", ...)

module.exports = router;
