// routes/exam.route.js → CHỈ PUBLIC EXAMS
const express = require("express");
const router = express.Router();
const examCtrl = require("../controllers/exam/Exam.controller");

// 1. Guest + User: Xem danh sách đề công khai
router.get("/", examCtrl.getAllPublicPaginated);
router.get("/list", examCtrl.getAllPublic); // nếu cần dạng ngắn

// 2. Guest + User: Lấy đề để làm bài
router.get("/:id", examCtrl.getPublicById);
// routes/exam.route.js
router.get("/:id", examCtrl.getPublicExamDetail); // ← THAY BẰNG HÀM MỚI
module.exports = router;
