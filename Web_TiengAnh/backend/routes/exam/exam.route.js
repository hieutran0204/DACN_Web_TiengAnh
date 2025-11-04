const express = require("express");
const router = express.Router();
const examController = require("../../controllers/exam/Exam.controller");

router.post("/", examController.create);
router.get("/", examController.getAll);
router.get("/paginated", examController.getAllPaginated);
router.get("/:id", examController.getById);
router.put("/:id", examController.updateExam); // Thêm route cập nhật
router.delete("/:id", examController.delete);

module.exports = router;
