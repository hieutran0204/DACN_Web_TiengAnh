
const router = require("express").Router();
const wordTopicRoutes = require("./admin/wordguessing/wordTopic.route");
console.log("Loaded wordTopicRoutes:", wordTopicRoutes); // Kiểm tra nếu undefined hoặc error
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
router.use("/user/game", require("./user/game.route")); // SỬA: bỏ /api
router.use("/user/game/categories", require("./admin/game/category.route")); // User lấy danh sách
router.use("/user/game/matching", require("./user/game/matchingGame.route"));
router.use("/user/wordguessing", require("./user/wordguessing/wordCard.route"));


// Admin routes
router.use("/admin/questions", require("./admin/question.route"));
router.use("/admin/exam", require("./admin/exam/exam.route"));
router.use("/admin/part", require("./admin/part.route"));
router.use("/admin", require("./admin/user.route"));
router.use("/admin/news", require("./admin/news/news.route"));

router.use("/admin/game/categories", require("./admin/game/category.route"));
router.use("/admin/game/words", require("./admin/game/word.route"));
router.use("/admin/game/matching", require("./admin/game/matchingGame.route")); 

router.use("/admin/wordguessing/topics", require("./admin/wordguessing/wordTopic.route"));
router.use("/admin/wordguessing/cards", require("./admin/wordguessing/wordCard.route"));

module.exports = router;