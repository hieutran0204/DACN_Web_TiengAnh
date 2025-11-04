const express = require("express");
const router = express.Router();
const writingCtrl = require("../../controllers/writing/writingQuestion.controller");
const writing_upload = require("../../middlewares/writing_upload.middleware");

router.get("/writing-questions", writingCtrl.getAllPaginated);
router.get("/writing-questions/:id", writingCtrl.getById);
router.post("/writing-questions", writing_upload, writingCtrl.create);
router.put("/writing-questions/:id", writing_upload, writingCtrl.update);
router.delete("/writing-questions/:id", writingCtrl.delete);
router.get("/writing/part/:partId", writingCtrl.getByPart);

module.exports = router;
