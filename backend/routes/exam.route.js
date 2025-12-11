// routes/exam.route.js → CHỈ PUBLIC EXAMS
const express = require("express");
const router = express.Router();
const examCtrl = require("../controllers/exam/Exam.controller");

const { verifyTokenOptional } = require("../middlewares/auth");

// 1. Guest + User: Xem danh sách đề công khai
router.get("/", verifyTokenOptional, examCtrl.getAllPublicPaginated);
router.get("/list", verifyTokenOptional, examCtrl.getAllPublic); // nếu cần dạng ngắn

// 2. Guest + User: Lấy đề để làm bài
router.get("/:id", verifyTokenOptional, examCtrl.getPublicById);
// routes/exam.route.js
router.get("/:id", verifyTokenOptional, examCtrl.getPublicExamDetail); // ← THAY BẰNG HÀM MỚI
router.post("/:id/submit", verifyTokenOptional, examCtrl.submitExam); 
module.exports = router;
