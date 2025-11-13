// // // // const router = require("express").Router();
// // // // const { verifyToken, verifyAdmin } = require("../../middlewares/auth");
// // // // const userRepo = require("../../repositories/auth/user.repository");

// // // // router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
// // // //   const users = await userRepo.getAll();
// // // //   res.json(users);
// // // // });

// // // // module.exports = router;

// // // const router = require("express").Router();
// // // const { verifyToken, verifyAdmin } = require("../../middlewares/auth");
// // // const adminUserController = require("../../controllers/admin/user/user.controller");

// // // // ✅ CRUD routes
// // // router.get("/users", verifyToken, verifyAdmin, adminUserController.getAll);
// // // router.get("/users/:id", verifyToken, verifyAdmin, adminUserController.getById);
// // // router.post("/users", verifyToken, verifyAdmin, adminUserController.create);
// // // router.put("/users/:id", verifyToken, verifyAdmin, adminUserController.update);
// // // router.delete(
// // //   "/users/:id",
// // //   verifyToken,
// // //   verifyAdmin,
// // //   adminUserController.delete
// // // );

// // // module.exports = router;

// // // routes/admin/user.route.js
// // const router = require("express").Router();
// // const { verifyToken, verifyAdmin } = require("../../middlewares/auth");
// // const adminUserController = require("../../controllers/admin/user/user.controller");

// // router.get("/users", verifyToken, verifyAdmin, adminUserController.getAll);
// // router.get("/users/:id", verifyToken, verifyAdmin, adminUserController.getById);
// // router.post("/users", verifyToken, verifyAdmin, adminUserController.create);
// // router.put("/users/:id", verifyToken, verifyAdmin, adminUserController.update);
// // router.delete(
// //   "/users/:id",
// //   verifyToken,
// //   verifyAdmin,
// //   adminUserController.delete
// // );
// // router.get("/roles", verifyToken, verifyAdmin, adminUserController.getRoles);

// // module.exports = router;

// // routes/admin/user.route.js
// const router = require("express").Router();
// const { verifyToken, verifyAdmin } = require("../../middlewares/auth");
// const adminUserController = require("../../controllers/admin/user/user.controller");

// // TẤT CẢ ROUTE CON – ĐÚNG ĐƯỜNG DẪN
// router.get("/", verifyToken, verifyAdmin, adminUserController.getAll);
// router.get("/:id", verifyToken, verifyAdmin, adminUserController.getById);
// router.post("/", verifyToken, verifyAdmin, adminUserController.create);
// router.put("/:id", verifyToken, verifyAdmin, adminUserController.update);
// router.delete("/:id", verifyToken, verifyAdmin, adminUserController.delete);

// // ĐÚNG: /api/admin/users/roles
// router.get("/roles", verifyToken, verifyAdmin, adminUserController.getRoles);

// module.exports = router;

// routes/admin/user.route.js
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
