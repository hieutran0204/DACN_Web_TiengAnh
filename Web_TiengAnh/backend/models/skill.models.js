const mongoose = require("mongoose");

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["listening", "reading", "writing", "speaking"],
    required: true,
    unique: true,
  },
  description: String,
});

module.exports = mongoose.model("Skill", SkillSchema, "Skills");
