const router = require("express").Router();
console.log("--> Loading Vocabulary Routes...");
const controller = require("../../controllers/vocabulary/wordCategory.controller");

router.get("/", controller.getAllCategories);
router.get("/:id", controller.getCategoryById);
router.post("/", controller.createCategory);
router.put("/:id", controller.updateCategory);
router.delete("/:id", controller.deleteCategory);
router.put("/:id/words", controller.updateWords);
router.post("/seed", controller.seedCategories);
router.get("/lookup/:word", controller.lookupWord);

console.log("--> Vocabulary Routes Exported");
module.exports = router;
