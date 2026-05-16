const express = require("express");
const router = express.Router();
const listeningCtrl = require("../../../controllers/listening/listeningQuestion.controller");

// Public (or User) routes for Listening/Dictation
router.get("/", listeningCtrl.getAllPaginated);
router.get("/:id", listeningCtrl.getById);

module.exports = router;
