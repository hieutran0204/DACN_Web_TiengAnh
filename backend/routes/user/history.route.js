const router = require("express").Router();
const { verifyToken } = require("../../middlewares/auth");
const historyController = require("../../controllers/user/history.controller");

// Lấy tổng quan (cho tab overview)
router.get("/overview", verifyToken, historyController.getOverview);

// Lấy danh sách lịch sử tổng hợp (tất cả các bài thi, writing)
router.get("/me", verifyToken, historyController.getMyHistory);

// Lấy chi tiết lịch sử một dạng trắc nghiệm/exam cụ thể
router.get("/exam/:id", verifyToken, historyController.getExamHistoryDetail);

// Lấy chi tiết bài writing đã chấm
router.get("/writing/:id", verifyToken, historyController.getWritingHistoryDetail);

module.exports = router;
