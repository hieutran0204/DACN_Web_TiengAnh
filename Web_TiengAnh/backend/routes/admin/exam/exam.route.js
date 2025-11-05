const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../../../middlewares/auth");
const examCtrl = require("../../../controllers/exam/Exam.controller");

router.post("/", verifyToken, verifyAdmin, examCtrl.create);
router.put("/:id", verifyToken, verifyAdmin, examCtrl.updateExam);
router.delete("/:id", verifyToken, verifyAdmin, examCtrl.delete);

module.exports = router;
