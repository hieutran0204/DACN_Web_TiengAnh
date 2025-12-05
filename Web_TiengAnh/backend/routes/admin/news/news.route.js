const express = require("express");
const router = express.Router();
const newsController = require("../../../controllers/admin/news/news.controller");
const { uploadNewsImage } = require("../../../middlewares/upload.middleware");
const { validateObjectId } = require("../../../middlewares/game/game_validation.middleware");

// CRUD routes với upload ảnh
router.post("/", uploadNewsImage, newsController.create);
router.get("/", newsController.getAll);
router.get("/:id", validateObjectId, newsController.getById);
router.put("/:id", validateObjectId, uploadNewsImage, newsController.update);
router.delete("/:id", validateObjectId, newsController.delete);

module.exports = router;