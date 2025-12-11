const express = require("express");
const router = express.Router();
const newsAdminController = require("../../../controllers/admin/news/news.controller");

// (có thể thêm middleware check quyền admin ở đây)
router.post("/", newsAdminController.create);
router.get("/", newsAdminController.getAll);
router.get("/:id", newsAdminController.getById);
router.put("/:id", newsAdminController.update);
router.delete("/:id", newsAdminController.delete);

module.exports = router;
