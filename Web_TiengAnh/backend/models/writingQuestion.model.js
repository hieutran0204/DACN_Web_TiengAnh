const mongoose = require("mongoose");

const WritingQuestionSchema = new mongoose.Schema({
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

  task: {
    type: String,
    enum: ["Task 1", "Task 2"],
    required: true,
  },

  type: {
    type: String,
    enum: [
      // Task 1 - Academic
      "bar_chart",
      "line_graph",
      "pie_chart",
      "table",
      "process",
      "map",
      "mixed_chart",
      // Task 1 - General
      "formal_letter",
      "semi_formal_letter",
      "informal_letter",
      // Task 2
      "opinion",
      "discussion",
      "problem_solution",
      "cause_effect",
      "advantage_disadvantage",
    ],
    required: true,
  },

  topic: {
    type: String,
    required: true,
    trim: true,
  },

  question: {
    type: String,
    required: true,
    trim: true,
  },

  suggestedIdeas: {
    type: [String],
    default: [],
  },

  sampleAnswer: {
    type: String,
    default: "",
  },

  image: {
    type: String,
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

module.exports = mongoose.model("WritingQuestion", WritingQuestionSchema);
