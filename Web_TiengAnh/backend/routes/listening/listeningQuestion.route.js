// const router = require("express").Router();
// const controller = require("../../controllers/listening/listeningQuestion.controller");
// const listening_upload = require("../../middlewares/listening_upload.middleware");
// const auth = require("../../middlewares/auth");

// router.get("/", auth, controller.getAll);
// router.get("/:id", auth, controller.getById);
// router.post("/", auth, listening_upload, controller.create);
// router.put("/:id", auth, listening_upload, controller.update); // Thêm listening_upload
// router.delete("/:id", auth, controller.delete);

// module.exports = router;
const express = require("express");
const router = express.Router();
const listening_upload = require("../../middlewares/listening_upload.middleware");
const listeningCtrl = require("../../controllers/listening/listeningQuestion.controller");
router.get("/listening-questions", listeningCtrl.getAllPaginated); // API phân trang
router.get("/listening-questions/:id", listeningCtrl.getById);
router.post("/listening-questions", listening_upload, listeningCtrl.create);
router.put("/listening-questions/:id", listening_upload, listeningCtrl.update);
router.delete("/listening-questions/:id", listeningCtrl.delete);
router.get("/listening/part/:partId", listeningCtrl.getByPart);

module.exports = router;
