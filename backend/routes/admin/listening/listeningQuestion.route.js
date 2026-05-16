const express = require("express");
const router = express.Router();
const listening_upload = require("../../../middlewares/listening_upload.middleware");
const listeningCtrl = require("../../../controllers/listening/listeningQuestion.controller");
// const auth = require("../../middlewares/auth");
router.get("/listening-questions", listeningCtrl.getAllPaginated); // API phân trang
router.get("/listening-questions/:id", listeningCtrl.getById);
router.post("/listening-questions", listening_upload, listeningCtrl.create);
router.put("/listening-questions/:id", listening_upload, listeningCtrl.update);
router.delete("/listening-questions/:id", listeningCtrl.delete);
router.post("/listening-questions/generate-transcript", listeningCtrl.generateTranscript); // Auto Gen Route
// router.get("/listening/part/:partId", listeningCtrl.getBySection);

module.exports = router;
