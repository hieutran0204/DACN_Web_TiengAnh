// const mongoose = require("mongoose");

// const ListeningQuestionSchema = new mongoose.Schema({
//   section: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Section",
//     required: true,
//   },

//   type: {
//     type: String,
//     enum: [
//       "form_note_table_completion",
//       "summary_completion",
//       "multiple_choice_single",
//       "multiple_choice_multiple",
//       "matching",
//       "plan_map_diagram_labelling",
//       "sentence_completion",
//       "short_answer",
//     ],
//     required: true,
//   },

//   title: String,
//   content: String,
//   instruction: String,

//   audio: { type: String, required: true },
//   image: { type: String },

//   subQuestions: [
//     {
//       questionNumber: Number,
//       question: String,
//       options: [String],
//       correctAnswers: [String],
//       wordLimit: Number,
//       label: String,
//       correctLabel: String,
//       note: String,
//     },
//   ],

//   explanation: String,
//   difficulty: {
//     type: String,
//     enum: ["easy", "medium", "hard"],
//     default: "medium",
//   },

//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model(
//   "ListeningQuestion",
//   ListeningQuestionSchema,
//   "ListeningQuestions"
// );

const mongoose = require("mongoose");

const ReadingPassageSchema = new mongoose.Schema({
  // ===== Phân loại (Passage 1, 2, 3) =====
  passage: {
    type: String,
    required: true,
  },

  // ===== Thông tin nội dung =====
  title: {
    type: String,
    required: true,
  },

  content: {
    type: String, // nội dung chính của đoạn đọc
    required: true,
  },

  image: {
    type: String, // ảnh minh họa (nếu có)
  },

  // ===== DANH SÁCH CÂU HỎI CON =====
  subQuestions: [
    {
      questionNumber: Number,
      type: {
        type: String,
        enum: [
          "multiple_choice",
          "true_false_not_given",
          "yes_no_not_given",
          "matching_headings",
          "matching_information",
          "matching_features",
          "matching_sentence_endings",
          "sentence_completion",
          "summary_completion",
          "diagram_label_completion",
        ],
        required: true,
      },
      question: String,
      options: [String],
      answer: String,
      wordLimit: Number,
      labels: [String],
      correctLabel: String,

      // Có thể chứa nội dung đặc thù nếu là dạng khác
      paragraph: String, // cho dạng matching headings / information
      explanation: String,
    },
  ],

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
  "ReadingPassage",
  ReadingPassageSchema,
  "ReadingPassages"
);
