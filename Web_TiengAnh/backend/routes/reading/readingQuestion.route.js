const router = require("express").Router();
const controller = require("../../controllers/reading/readingQuestion.controller");
const reading_upload = require("../../middlewares/reading_upload.middleware");
const auth = require("../../middlewares/auth");

router.get("/", auth, controller.getAll);
router.get("/:id", auth, controller.getById);
router.post("/", auth, reading_upload, controller.create);
router.put("/:id", auth, reading_upload, controller.update);
router.delete("/:id", auth, controller.delete);
router.get("/part/:partId", auth, controller.getByPart);

module.exports = router;
