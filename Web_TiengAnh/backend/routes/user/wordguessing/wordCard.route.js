const express = require("express");
const router = express.Router();
const wordCardUserController = require("../../../controllers/user/wordguessing/wordCard.user.controller");
const { validateObjectId } = require("../../../middlewares/game/game_validation.middleware");

// User routes - chơi game
router.get("/cards/topic/:topicId/random", validateObjectId, wordCardUserController.getRandomCard);
router.get("/cards/topic/:topicId", validateObjectId, wordCardUserController.getCardsByTopic);

module.exports = router;