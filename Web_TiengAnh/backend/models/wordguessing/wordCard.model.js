const mongoose = require("mongoose");

const WordCardSchema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WordTopic",
    required: true,
    index: true
  },
  keyword: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  hintSentence: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  sentenceWithBlank: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index để query nhanh
WordCardSchema.index({ topic: 1 });

module.exports = mongoose.model("WordCard", WordCardSchema, "WordCards");