const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },

  // Mỗi kỹ năng có nhiều câu
  skills: {
    listening: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ListeningQuestion",
      },
    ],
    reading: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ReadingQuestion",
      },
    ],
    writing: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WritingQuestion",
      },
    ],
    speaking: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SpeakingQuestion",
      },
    ],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  durationMinutes: {
    type: Number,
    default: 60,
  },
});

module.exports = mongoose.model("Exam", ExamSchema, "Exams");
