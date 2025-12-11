// routes/user/profile.route.js
const router = require("express").Router();
const { verifyToken } = require("../../middlewares/auth");
const profileController = require("../../controllers/user/profile.controller");

router.get("/me", verifyToken, profileController.getMyProfile);
router.put("/me", verifyToken, profileController.updateMyProfile);

module.exports = router;
