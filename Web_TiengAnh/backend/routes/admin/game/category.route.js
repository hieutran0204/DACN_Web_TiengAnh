// const express = require("express");
// const router = express.Router();
// const categoryAdminController = require("../../../controllers/admin/game/category.controller");
// const { validateCategory, validateObjectId } = require("../../../middlewares/game/game_validation.middleware");

// router.post("/", validateCategory, categoryAdminController.create);
// router.get("/", categoryAdminController.getAll);
// router.get("/:id", validateObjectId, categoryAdminController.getById);
// router.put("/:id", validateObjectId, validateCategory, categoryAdminController.update);
// router.delete("/:id", validateObjectId, categoryAdminController.delete);

// module.exports = router;
const express = require("express");
const router = express.Router();

// Controller
const categoryAdminController = require("../../../controllers/admin/game/category.controller");

// Middleware validation (đường dẫn đúng: từ routes/admin/game → lên backend → middlewares/game)
const { validateCategory, validateObjectId } = require("../../../middlewares/game/game_validation.middleware");

// === ROUTES ===
router.post("/", validateCategory, categoryAdminController.create);
router.get("/", categoryAdminController.getAll);
router.get("/:id", validateObjectId, categoryAdminController.getById);
router.put("/:id", validateObjectId, validateCategory, categoryAdminController.update);
router.delete("/:id", validateObjectId, categoryAdminController.delete);

module.exports = router;