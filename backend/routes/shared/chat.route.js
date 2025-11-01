const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../../middlewares/auth.middleware");
const ChatController = require("../../controllers/shared/chat.controller");

router.get("/chat", verifyToken, ChatController.showClientChat);
router.get("/admin/chat", verifyToken, isAdmin, ChatController.showAdminChat);

module.exports = router;
