// const express = require("express");
// const router = express.Router();
// const writingCtrl = require("../../../controllers/writing/writingQuestion.controller");
// const writing_upload = require("../../../middlewares/writing_upload.middleware");

// router.get("/writing-questions", writingCtrl.getAllPaginated);
// router.get("/writing-questions/:id", writingCtrl.getById);
// router.post("/writing-questions", writing_upload, writingCtrl.create);
// router.put("/writing-questions/:id", writing_upload, writingCtrl.update);
// router.delete("/writing-questions/:id", writingCtrl.delete);
// router.get("/writing/part/:partId", writingCtrl.getByPart);
// router.get("/writing-questions", writingCtrl.getAllSimple);
// module.exports = router;
const express = require("express");
const router = express.Router();
const writingCtrl = require("../../../controllers/writing/writingQuestion.controller");
const writing_upload = require("../../../middlewares/writing_upload.middleware");

// TẤT CẢ ĐỀU DƯỚI /writing (vì đã được mount ở /writing rồi)
router.get("/", writingCtrl.getAllPaginated); // List
router.get("/:id", writingCtrl.getById); // Detail + Edit load
router.post("/", writing_upload, writingCtrl.create); // Create
router.put("/:id", writing_upload, writingCtrl.update); // Edit save
router.delete("/:id", writingCtrl.delete); // Delete
router.get("/part/:partId", writingCtrl.getByPart); // Bonus

module.exports = router;
