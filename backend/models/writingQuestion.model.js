const mongoose = require("mongoose");

const WritingQuestionSchema = new mongoose.Schema({
  skill: {
    type: String,
    enum: ["writing"], // ← Giống hệt Speaking
    default: "writing", // ← Tự động gán luôn
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
      // Task 1
      "bar_chart",
      "line_graph",
      "pie_chart",
      "table",
      "process",
      "map",
      "mixed_chart",

      // Task 2
      "opinion",
      "discussion",
      "problem_solution",
      "cause_effect",
      "advantage_disadvantage",
      "two_part_question",
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

  sampleAnswer: {
    type: String,
    default: "",
  },

  image: {
    type: String, // Deprecated, kept for backward compatibility
  },
  images: {
    type: [String], // URL ảnh cho Task 1 (support multiple)
    default: [],
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

// Index để tìm kiếm nhanh hơn
WritingQuestionSchema.index({ task: 1, type: 1 });
WritingQuestionSchema.index({ topic: "text", question: "text" });

module.exports = mongoose.model("WritingQuestion", WritingQuestionSchema);
