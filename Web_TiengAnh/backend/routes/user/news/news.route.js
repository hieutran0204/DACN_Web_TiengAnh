const express = require("express");
const router = express.Router();
const newsUserController = require("../../../controllers/user/news/news.user.controller");
const { validateObjectId } = require("../../../middlewares/game/game_validation.middleware");

// User routes
router.get("/", newsUserController.getAll);
router.get("/:id", validateObjectId, newsUserController.getById);
router.post("/:id/check-answer", validateObjectId, newsUserController.checkAnswer);

module.exports = router;