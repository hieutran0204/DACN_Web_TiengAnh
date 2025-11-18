const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    trim: true
  },
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true // Mảng không rỗng
  }],
  hint: {
    type: String,
    required: true
  },
  meaning: {
    type: String,
    required: true
  },
  usage: {
    type: String,
    required: true
  },
  example: {
    type: String,
    required: true
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Word", wordSchema);