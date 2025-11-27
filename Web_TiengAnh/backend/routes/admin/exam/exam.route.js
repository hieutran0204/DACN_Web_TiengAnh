// const express = require("express");
// const router = express.Router();
// const { verifyToken, verifyAdmin } = require("../../../middlewares/auth");
// const examCtrl = require("../../../controllers/exam/Exam.controller");

// router.post("/", verifyToken, verifyAdmin, examCtrl.create);
// router.put("/:id", verifyToken, verifyAdmin, examCtrl.updateExam);
// router.delete("/:id", verifyToken, verifyAdmin, examCtrl.deleteExam);
// router.delete("/:id/publish", verifyToken, verifyAdmin, examCtrl.publishExam);
// module.exports = router;

// routes/admin/exam/exam.route.js
const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../../../middlewares/auth");
const examCtrl = require("../../../controllers/exam/Exam.controller");

// Bảo vệ tất cả route admin
router.use(verifyToken, verifyAdmin);

// Quản lý đề thi (admin thấy cả draft)
router.post("/", examCtrl.create);
router.get("/", examCtrl.getAllPaginated); // thấy hết
router.get("/:id", examCtrl.getById); // thấy đầy đủ
router.put("/:id", examCtrl.updateExam);
router.patch("/:id/publish", examCtrl.publishExam); // đổi thành PATCH
router.delete("/:id", examCtrl.deleteExam);

module.exports = router;
