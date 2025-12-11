const router = require("express").Router();
const Skill = require("../../models/skill.models");

router.post("/", async (req, res) => {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json(skill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const skills = await Skill.find();
  res.json({ data: skills }); // ✅ thêm bọc "data"
});

module.exports = router;
