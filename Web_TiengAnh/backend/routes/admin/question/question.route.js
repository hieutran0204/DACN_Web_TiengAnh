// routes/admin/question/question.route.js
const router = require("express").Router();

// Tự động mount các skill
router.use("/listening", require("../listening/listeningQuestion.route"));
router.use("/reading", require("../reading/readingQuestion.route"));
router.use("/speaking", require("../speaking/speakingQuestion.route"));
router.use("/writing", require("../writing/writingQuestion.route"));

module.exports = router;
