const router = require("express").Router();
const { verifyToken } = require("../../../middlewares/auth");
const examCtrl = require("../../../controllers/exam/Exam.controller");
// console.log("examCtrl debug:", examCtrl);

// 1. KHÁCH VÃNG LAI: Xem danh sách đề
router.get("/public", examCtrl.getAll); // ← KHÔNG TOKEN
router.get("/public/paginated", examCtrl.getAllPaginated);
router.get("/public/:id", examCtrl.getById);

// 2. USER ĐÃ LOGIN: Xem đề + kết quả cá nhân
router.get("/", verifyToken, examCtrl.getAll);
router.get("/paginated", verifyToken, examCtrl.getAllPaginated);
router.get("/:id", verifyToken, examCtrl.getById);

module.exports = router;
