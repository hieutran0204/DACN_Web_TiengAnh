const express = require("express");
const router = express.Router();
const newsUserController = require("../../../controllers/user/news/news.controller");

router.get("/", newsUserController.getAll);
router.get("/:id", newsUserController.getById);

module.exports = router;
