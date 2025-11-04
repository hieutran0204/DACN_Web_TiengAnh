const mongoose = require("mongoose");

const SpeakingQuestionSchema = new mongoose.Schema({
  // part: {
  //   type: Number,
  //   enum: [1, 2, 3],
  //   required: true,
  // },
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Part",
    required: true,
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skill",
    required: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },

  type: {
    type: String,
    enum: [
      "personal_experience",
      "descriptive",
      "comparative",
      "opinion_based",
      "cause_effect",
      "hypothetical",
      "advantage_disadvantage",
      "problem_solution",
      "prediction",
      "abstract",
    ],
    required: true,
  },

  question: {
    type: String,
    required: true,
    trim: true,
  },

  subQuestions: {
    type: [String], // chỉ dùng cho Part 2 (cue card) hoặc Part 3 nếu có follow-up
    default: [],
  },

  suggestedIdeas: {
    type: [String], // keyword hoặc idea để hướng dẫn học sinh
    default: [],
  },

  sampleAnswer: {
    type: String,
    default: "",
  },

  image: {
    type: String, // URL nếu có hình minh họa
  },

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

module.exports = mongoose.model("SpeakingQuestion", SpeakingQuestionSchema);
