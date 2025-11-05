const router = require("express").Router();
const { verifyToken, verifyAdmin } = require("../../middlewares/auth");
const userRepo = require("../../repositories/auth/user.repository");

router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  const users = await userRepo.getAll();
  res.json(users);
});

module.exports = router;
