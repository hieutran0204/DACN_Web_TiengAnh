const express = require("express");
const router = express.Router();
const speakingController = require("../../../controllers/user/speaking/speaking.controller");
const { uploadAudio } = require("../../../middlewares/upload.middleware");

// Route chat với AI
router.post("/chat", uploadAudio, speakingController.chatWithAI);
router.post("/grade", speakingController.gradeConversation);

module.exports = router;
