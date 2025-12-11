const router = require("express").Router();
const { verifyToken } = require("../../../middlewares/auth");
const ctrl = require("../../../controllers/reading/readingQuestion.controller");

router.get("/", verifyToken, ctrl.getAllPaginated);
router.get("/:id", verifyToken, ctrl.getById);
router.get("/part/:partId", verifyToken, ctrl.getById);

module.exports = router;
