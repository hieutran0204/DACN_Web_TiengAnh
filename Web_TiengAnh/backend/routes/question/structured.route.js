const express = require("express");
const router = express.Router();
const controller = require("../../controllers/question/structured.controller");

router.get("/structured", controller.getStructuredQuestions);
router.get("/paginated", controller.getAllPaginated); // ?skill=listening&page=1&limit=10
router.get("/questions/:id", controller.getQuestionById); // Thêm route mới

module.exports = router;
