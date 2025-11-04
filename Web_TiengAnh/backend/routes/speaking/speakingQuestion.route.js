const express = require("express");
const router = express.Router();
const speakingCtrl = require("../../controllers/speaking/speakingQuestion.controller");
const speaking_upload = require("../../middlewares/speaking_upload.middleware");

router.get("/speaking-questions", speakingCtrl.getAllPaginated);
router.get("/speaking-questions/:id", speakingCtrl.getById);
router.post("/speaking-questions", speaking_upload, speakingCtrl.create);
router.put("/speaking-questions/:id", speaking_upload, speakingCtrl.update);
router.delete("/speaking-questions/:id", speakingCtrl.delete);
router.get("/speaking/part/:partId", speakingCtrl.getByPart);

module.exports = router;
