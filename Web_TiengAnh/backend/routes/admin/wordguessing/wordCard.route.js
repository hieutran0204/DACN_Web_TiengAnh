const express = require("express");
const router = express.Router();
const wordCardController = require("../../../controllers/admin/wordguessing/wordCard.controller");
const {
  validateObjectId,
} = require("../../../middlewares/game/game_validation.middleware");

router.post("/", wordCardController.create);
router.get("/", wordCardController.getAll);
router.get("/:id", validateObjectId, wordCardController.getById);
router.get("/topic/:topicId", validateObjectId, wordCardController.getByTopic);
router.put("/:id", validateObjectId, wordCardController.update);
router.delete("/:id", validateObjectId, wordCardController.delete);

module.exports = router;
