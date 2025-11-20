// // routes/admin.route.js
// const router = require("express").Router();
// const userRepo = require("../../repositories/auth/user.repository");

// // DÙNG ĐÚNG MIDDLEWARE AUTH BÁC ĐÃ VIẾT SẴN!
// const adminOnly = require("../../middlewares/auth"); // ← file auth.js bác vừa gửi

// router.use(adminOnly); // ← Chỉ admin mới vào được

// module.exports = router;

// routes/admin.route.js  ← FILE DUY NHẤT CẦN GIỮ LẠI

const router = require("express").Router();
const userRepo = require("../../repositories/auth/user.repository");
const adminOnly = require("../../middlewares/auth");

// BỌC AUTH 1 LẦN DUY NHẤT – ÁP DỤNG CHO TẤT CẢ
router.use(adminOnly);

// 1. Quản lý người dùng
router.get("/users", async (req, res) => {
  try {
    const users = await userRepo.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 2. Quản lý đề thi, part, news...d
// router.use("/exam", require("./admin/exam/exam.route"));
// router.use("/part", require("./admin/part.route"));
// router.use("/news", require("./admin/news/news.route"));

// 3. QUẢN LÝ CÂU HỎI – DÙNG FILE question.route.js ĐỂ GOM 4 KỸ NĂNG (SIÊU SẠCH!)
router.use("/questions", require("./question/question.route"));

module.exports = router;
