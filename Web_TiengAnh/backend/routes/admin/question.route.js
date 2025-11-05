const router = require("express").Router();
const { verifyToken, verifyAdmin } = require("../../middlewares/auth");

// Middleware upload
const listening_upload = require("../../middlewares/listening_upload.middleware");
const reading_upload = require("../../middlewares/reading_upload.middleware");
const speaking_upload = require("../../middlewares/speaking_upload.middleware");
const writing_upload = require("../../middlewares/writing_upload.middleware");

// Controller
const L = require("../../controllers/listening/listeningQuestion.controller");
const R = require("../../controllers/reading/readingQuestion.controller");
const S = require("../../controllers/speaking/speakingQuestion.controller");
const W = require("../../controllers/writing/writingQuestion.controller");

// === LISTENING ===
router.post("/listening", verifyToken, verifyAdmin, listening_upload, L.create);
router.put(
  "/listening/:id",
  verifyToken,
  verifyAdmin,
  listening_upload,
  L.update
);
router.delete("/listening/:id", verifyToken, verifyAdmin, L.delete);

// === READING ===
router.post("/reading", verifyToken, verifyAdmin, reading_upload, R.create);
router.put("/reading/:id", verifyToken, verifyAdmin, reading_upload, R.update);
router.delete("/reading/:id", verifyToken, verifyAdmin, R.delete);

// === SPEAKING ===
router.post("/speaking", verifyToken, verifyAdmin, speaking_upload, S.create);
router.put(
  "/speaking/:id",
  verifyToken,
  verifyAdmin,
  speaking_upload,
  S.update
);
router.delete("/speaking/:id", verifyToken, verifyAdmin, S.delete);

// === WRITING ===
router.post("/writing", verifyToken, verifyAdmin, writing_upload, W.create);
router.put("/writing/:id", verifyToken, verifyAdmin, writing_upload, W.update);
router.delete("/writing/:id", verifyToken, verifyAdmin, W.delete);

module.exports = router;
