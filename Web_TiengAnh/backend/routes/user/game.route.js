const express = require("express");
const router = express.Router();
const gameUserController = require('../../controllers/user/game.controller');

router.get("/categories", gameUserController.getAllCategories);
router.get("/random-word/:categoryId", gameUserController.getRandomWord);
router.post("/check-answer", gameUserController.checkAnswer);
module.exports = router;