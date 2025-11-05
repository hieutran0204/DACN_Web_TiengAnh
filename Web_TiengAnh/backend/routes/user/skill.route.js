const router = require("express").Router();
const { verifyToken } = require("../../middlewares/auth");
const Skill = require("../../models/skill.models");

router.get("/", verifyToken, async (req, res) => {
  const skills = await Skill.find();
  res.json({ data: skills });
});

module.exports = router;
