const express = require("express");
const router = express.Router();
const readingCtrl = require("../../../controllers/reading/readingQuestion.controller");
const reading_upload = require("../../../middlewares/reading_upload.middleware");

router.get("/reading-questions", readingCtrl.getAllPaginated); // Sử dụng getAllPaginated thay getAll để tránh xung đột
// router.get("/reading-questions", readingCtrl.getAll); // Xóa hoặc comment dòng này để tránh trùng lặp
router.get("/reading-questions/:id", readingCtrl.getById); // Sửa thành :id
router.post("/reading-questions", reading_upload, readingCtrl.create);
router.put("/reading-questions/:id", reading_upload, readingCtrl.update); // Sửa thành :id
router.delete("/reading-questions/:id", readingCtrl.delete); // Sửa thành :id
router.get("/reading/part/:partId", readingCtrl.getById);

module.exports = router;
