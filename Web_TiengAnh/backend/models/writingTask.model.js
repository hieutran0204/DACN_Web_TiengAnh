const mongoose = require("mongoose");

const WritingTaskSchema = new mongoose.Schema({
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Part", // Tham chiếu đến phần thi cụ thể
    required: true,
  },

  taskType: {
    type: String,
    enum: ["task_1_academic", "task_1_general", "task_2"],
    required: true,
  },

  questionType: {
    type: String,
    enum: [
      // Task 1 Academic
      "line_graph",
      "bar_chart",
      "pie_chart",
      "table",
      "process",
      "map",

      // Task 1 General
      "letter_formal",
      "letter_semi_formal",
      "letter_informal",

      // Task 2 (chung)
      "opinion",
      "discussion",
      "problem_solution",
      "adv_disadv",
      "two_part",
    ],
    required: true,
  },

  question: {
    type: String,
    required: true,
  },

  sampleAnswer: {
    type: String,
  },

  bandScore: {
    type: Number, // ví dụ 6.5, 7.0
    min: 0,
    max: 9,
  },

  explanation: {
    type: String,
  },

  difficult: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "WritingTask",
  WritingTaskSchema,
  "WritingTasks"
);
