const router = require("express").Router();
const { verifyToken, verifyAdmin } = require("../../middlewares/auth");
const adminUserController = require("../../controllers/admin/user/user.controller");

// TẤT CẢ ROUTE CON
router.get("/", verifyToken, verifyAdmin, adminUserController.getAll); // /api/admin/users
router.get("/:id", verifyToken, verifyAdmin, adminUserController.getById); // /api/admin/users/abc123
router.post("/", verifyToken, verifyAdmin, adminUserController.create);
router.put("/:id", verifyToken, verifyAdmin, adminUserController.update);
router.delete("/:id", verifyToken, verifyAdmin, adminUserController.delete);
router.get("/roles", verifyToken, verifyAdmin, adminUserController.getRoles);

module.exports = router;
