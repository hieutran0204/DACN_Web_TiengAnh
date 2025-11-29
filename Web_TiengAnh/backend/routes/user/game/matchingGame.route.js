const express = require("express");
const router = express.Router();

const matchingGameUserController = require("../../../controllers/user/game/matchingGame.user.controller");
// const { validateObjectId } = require("../../../middlewares/game/game_validation.middleware");

// TẠM BỎ validateObjectId để test
router.get(
  "/category/:categoryId/random",
  matchingGameUserController.getRandomGame
);
router.get(
  "/category/:categoryId",
  matchingGameUserController.getGamesByCategory
);

module.exports = router;
