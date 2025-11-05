// routes/admin.route.js
const router = require("express").Router();
const userRepo = require("../../repositories/auth/user.repository");

// DÙNG ĐÚNG MIDDLEWARE AUTH BÁC ĐÃ VIẾT SẴN!
const adminOnly = require("../../middlewares/auth"); // ← file auth.js bác vừa gửi

router.use(adminOnly); // ← Chỉ admin mới vào được

router.get("/users", async (req, res) => {
  try {
    const users = await userRepo.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
