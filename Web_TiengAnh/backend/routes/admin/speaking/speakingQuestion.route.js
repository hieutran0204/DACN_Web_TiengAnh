const router = require("express").Router();
const speaking_upload = require("../../../middlewares/speaking_upload.middleware");
const SpeakingQuestionController = require("../../../controllers/speaking/speakingQuestion.controller");

router.post("/", speaking_upload, SpeakingQuestionController.create);

router.get("/", SpeakingQuestionController.getAll);

router.get("/paginated", SpeakingQuestionController.getAllPaginated);

router.get("/:id", SpeakingQuestionController.getById);

router.put("/:id", speaking_upload, SpeakingQuestionController.update);

router.delete("/:id", SpeakingQuestionController.delete);

router.get("/part/:partId", SpeakingQuestionController.getByPart);

module.exports = router;
