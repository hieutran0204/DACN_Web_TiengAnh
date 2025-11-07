// routes/index.js
const router = require("express").Router();

// Auth
router.use("/auth", require("./auth/auth.route"));

// User routes

router.use("/exam", require("./user/exam/exam.route"));

// router.use("/exam", require("./user/exam/exam.route"));
router.use("/listening", require("./user/listening/listening.route"));
router.use("/reading", require("./user/reading/reading.route"));
router.use("/speaking", require("./user/speaking/speaking.route"));
router.use("/writing", require("./user/writing/writing.route"));
router.use("/skills", require("./user/skill.route"));
router.use("/news", require("./user/news/news.route"));
// Admin routes
router.use("/admin/questions", require("./admin/question.route"));
router.use("/admin/exam", require("./admin/exam/exam.route"));
router.use("/admin/part", require("./admin/part.route"));
router.use("/admin", require("./admin/user.route"));
router.use("/admin/news", require("./admin/news/news.route"));
module.exports = router;
