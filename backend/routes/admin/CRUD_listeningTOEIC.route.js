const express = require("express");
const router = express.Router();
const listeningController = require("../../controllers/admin/create/question/TOEIC/listening/CRUD_listeningTOEIC.controller");
const {
  uploadListening,
  handleListeningError,
} = require("../../middlewares/uploadListening.middleware");

router.get("/", listeningController.getAllQuestions);
router.get("/create", listeningController.showCreateForm);

// Định tuyến riêng cho từng Part
router.post(
  "/create",
  uploadListening.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "diagram", maxCount: 1 },
  ]),
  handleListeningError,
  listeningController.createListeningQuestion
);

router.get("/edit/:id", listeningController.showEditForm);
router.post(
  "/update/:id",
  uploadListening.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "diagram", maxCount: 1 },
  ]),
  handleListeningError,
  listeningController.updateQuestion
);
router.get("/delete/:id", listeningController.deleteQuestion);

router.get("/part/:part", listeningController.getQuestionsByPart);

module.exports = router;
