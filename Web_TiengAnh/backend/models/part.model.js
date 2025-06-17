const mongoose = require("mongoose");

const PartSchema = new mongoose.Schema({
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skill",
    required: true,
  },
  name: { type: String, required: true },
  description: String,
});

module.exports = mongoose.model("Part", PartSchema, "Parts");
