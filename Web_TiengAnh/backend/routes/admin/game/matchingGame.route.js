const express = require("express");
const router = express.Router();
const matchingGameController = require("../../../controllers/admin/game/matchingGame.controller");
const { validateObjectId } = require("../../../middlewares/game/game_validation.middleware");

// CRUD routes
router.post("/", matchingGameController.create);
router.get("/", matchingGameController.getAll);
router.get("/:id", validateObjectId, matchingGameController.getById);
router.get("/category/:categoryId", validateObjectId, matchingGameController.getByCategory);
router.put("/:id", validateObjectId, matchingGameController.update);
router.delete("/:id", validateObjectId, matchingGameController.delete);

module.exports = router;