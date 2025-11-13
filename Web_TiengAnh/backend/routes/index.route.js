// // // // routes/index.js
// // // const router = require("express").Router();

// // // // Auth
// // // router.use("/auth", require("./auth/auth.route"));

// // // // User routes

// // // router.use("/exam", require("./user/exam/exam.route"));

// // // // router.use("/exam", require("./user/exam/exam.route"));
// // // router.use("/listening", require("./user/listening/listening.route"));
// // // router.use("/reading", require("./user/reading/reading.route"));
// // // router.use("/speaking", require("./user/speaking/speaking.route"));
// // // router.use("/writing", require("./user/writing/writing.route"));
// // // router.use("/skills", require("./user/skill.route"));
// // // router.use("/news", require("./user/news/news.route"));
// // // // Admin routes
// // // router.use("/admin/questions", require("./admin/question.route"));
// // // router.use("/admin/exam", require("./admin/exam/exam.route"));
// // // router.use("/admin/part", require("./admin/part.route"));
// // // router.use("/admin", require("./admin/user.route"));
// // // router.use("/admin/news", require("./admin/news/news.route"));
// // // module.exports = router;

// // // routes/index.js – PHIÊN BẢN HOÀN HẢO, KO BAO GIỜ BỊ LỖI 404 HAY CAST ID
// // const router = require("express").Router();

// // // === USER ROUTES ===
// // router.use("/exam", require("./user/exam/exam.route"));
// // router.use("/listening", require("./user/listening/listening.route"));
// // router.use("/reading", require("./user/reading/reading.route"));
// // router.use("/speaking", require("./user/speaking/speaking.route"));
// // router.use("/writing", require("./user/writing/writing.route"));
// // router.use("/skills", require("./user/skill.route"));
// // router.use("/news", require("./user/news/news.route"));
// // router.use("/user", require("./user/profile.route"));

// // // === ADMIN USER – ĐẶT TRƯỚC ĐỂ TRÁNH BỊ ĐÈ ===
// // router.get("/admin/users", require("./admin/user.route")); // ← GET LIST
// // router.post("/admin/users", require("./admin/user.route")); // ← CREATE
// // router.use("/admin/users", require("./admin/user.route")); // ← CÁC ROUTE KHÁC (/:id, /roles)

// // // === ADMIN KHÁC ===
// // router.use("/admin/questions", require("./admin/question.route"));
// // router.use("/admin/exam", require("./admin/exam/exam.route"));
// // router.use("/admin/part", require("./admin/part.route"));
// // router.use("/admin/news", require("./admin/news/news.route"));

// // module.exports = router;

// const router = require("express").Router();

// // User routes
// router.use("/exam", require("./user/exam/exam.route"));
// router.use("/listening", require("./user/listening/listening.route"));
// router.use("/reading", require("./user/reading/reading.route"));
// router.use("/speaking", require("./user/speaking/speaking.route"));
// router.use("/writing", require("./user/writing/writing.route"));
// router.use("/skills", require("./user/skill.route"));
// router.use("/news", require("./user/news/news.route"));
// router.use("/user", require("./user/profile.route"));

// // ADMIN USER – THỨ TỰ HOÀN HẢO
// router.use("/admin/users/roles", require("./admin/user.route"));
// router.use("/admin/users/:id", require("./admin/user.route"));
// router.use("/admin/users", require("./admin/user.route"));

// // Admin routes khác
// router.use("/admin/questions", require("./admin/question.route"));
// router.use("/admin/exam", require("./admin/exam/exam.route"));
// router.use("/admin/part", require("./admin/part.route"));
// router.use("/admin/news", require("./admin/news/news.route"));

// module.exports = router;

// routes/index.js – PHIÊN BẢN HOÀN HẢO, KO BAO GIỜ BỊ 404
const router = require("express").Router();

// === USER ROUTES – PHẢI ĐẶT TRƯỚC ADMIN ===
router.use("/user", require("./user/profile.route")); // ← /user/me, /user/me PUT
router.use("/exam", require("./user/exam/exam.route"));
router.use("/listening", require("./user/listening/listening.route"));
router.use("/reading", require("./user/reading/reading.route"));
router.use("/speaking", require("./user/speaking/speaking.route"));
router.use("/writing", require("./user/writing/writing.route"));
router.use("/skills", require("./user/skill.route"));
router.use("/news", require("./user/news/news.route"));

// === ADMIN ROUTES – ĐẶT SAU ĐỂ TRÁNH ĐÈ /user ===
// ADMIN USER – CHI TIẾT
router.get("/admin/users/roles", require("./admin/user.route"));
router.get("/admin/users", require("./admin/user.route"));
router.post("/admin/users", require("./admin/user.route"));
router.use("/admin/users/:id", require("./admin/user.route"));
router.use("/admin/users", require("./admin/user.route"));

// ADMIN KHÁC
router.use("/admin/questions", require("./admin/question.route"));
router.use("/admin/exam", require("./admin/exam/exam.route"));
router.use("/admin/part", require("./admin/part.route"));
router.use("/admin/news", require("./admin/news/news.route"));

module.exports = router;
