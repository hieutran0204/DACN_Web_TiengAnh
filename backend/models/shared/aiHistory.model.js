const mongoose = require("mongoose");

const aiHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skill: {
    type: String,
    enum: ["writing", "speaking", "reading", "listening"],
    required: true,
  },
  input: String,
  output: Object,
  modelUsed: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AIHistory", aiHistorySchema);
