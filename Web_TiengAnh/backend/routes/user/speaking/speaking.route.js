const router = require("express").Router();
const { verifyToken } = require("../../../middlewares/auth");
const ctrl = require("../../../controllers/speaking/speakingQuestion.controller");

router.get("/", verifyToken, ctrl.getAllPaginated);
router.get("/:id", verifyToken, ctrl.getById);
router.get("/part/:partId", verifyToken, ctrl.getByPart);

module.exports = router;
