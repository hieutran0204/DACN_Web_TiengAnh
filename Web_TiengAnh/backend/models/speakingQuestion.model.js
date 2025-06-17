const mongoose = require("mongoose");

const SpeakingQuestionSchema = new mongoose.Schema({
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Part", // Thay đổi từ Number sang ObjectId tham chiếu đến Part
    required: true,
  },

  topic: {
    type: String,
    required: true,
  },

  question: {
    type: String,
    required: true,
  },

  subQuestions: [String],

  sampleAnswer: String,

  explanation: String, // Thêm trường explanation để thống nhất

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "SpeakingQuestion",
  SpeakingQuestionSchema,
  "SpeakingQuestions"
);
