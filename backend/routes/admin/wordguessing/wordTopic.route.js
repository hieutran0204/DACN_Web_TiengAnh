const express = require("express");
const router = express.Router();
const wordTopicController = require("../../../controllers/admin/wordguessing/wordTopic.controller");
const {
  validateObjectId,
} = require("../../../middlewares/game/game_validation.middleware");

router.post("/", wordTopicController.create);
router.get("/", wordTopicController.getAll);
router.get("/:id", validateObjectId, wordTopicController.getById);
router.put("/:id", validateObjectId, wordTopicController.update);
router.delete("/:id", validateObjectId, wordTopicController.delete);

module.exports = router;
