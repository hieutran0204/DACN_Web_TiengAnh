// const express = require("express");
// const router = express.Router();
// const wordAdminController = require("../../../controllers/admin/game/word.controller");
// const { validateWord, validateObjectId } = require("../../../middlewares/game/game_validation.middleware");

// router.post("/", validateWord, wordAdminController.create);
// router.get("/", wordAdminController.getAll);
// router.get("/category/:categoryId", validateObjectId, wordAdminController.getByCategory);
// router.get("/:id", validateObjectId, wordAdminController.getById);
// router.put("/:id", validateObjectId, validateWord, wordAdminController.update);
// router.delete("/:id", validateObjectId, wordAdminController.delete);

// module.exports = router;
const express = require("express");
const router = express.Router();

const wordAdminController = require("../../../controllers/admin/game/word.controller");
const { validateWord, validateObjectId } = require("../../../middlewares/game/game_validation.middleware");

router.post("/", validateWord, wordAdminController.create);
router.get("/", wordAdminController.getAll);
router.get("/category/:categoryId", validateObjectId, wordAdminController.getByCategory);
router.get("/:id", validateObjectId, wordAdminController.getById);
router.put("/:id", validateObjectId, validateWord, wordAdminController.update);
router.delete("/:id", validateObjectId, wordAdminController.delete);

module.exports = router;