const router = require("express").Router();
const authController = require("../../controllers/auth.controller");
const {
  loginValidation,
  registerValidation,
} = require("../../validators/authValidator");

// Route POST /api/auth/login
router.post("/login", loginValidation, authController.login);

// Route POST /api/auth/register
router.post("/register", registerValidation, authController.register);

// Route POST /api/auth/logout
router.post("/logout", authController.logout);

module.exports = router;
