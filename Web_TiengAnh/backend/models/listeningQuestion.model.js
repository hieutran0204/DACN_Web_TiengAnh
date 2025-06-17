// const mongoose = require("mongoose");

// const ListeningQuestionSchema = new mongoose.Schema({
//   part: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Part",
//     required: true,
//   },

//   type: {
//     type: String,
//     enum: [
//       "form_note_table_completion",
//       "multiple_choice",
//       "matching",
//       "plan_map_diagram_labelling",
//       "sentence_completion",
//       "short_answer",
//     ],
//     required: true,
//   },

//   content: { type: String }, // phần nội dung chung

//   formNoteTableCompletion: {
//     instruction: String,
//     blanks: [String], // danh sách các chỗ trống
//     answers: [String], // đáp án tương ứng
//     wordLimit: Number, // giới hạn từ
//   },

//   multipleChoice: {
//     question: String,
//     options: [String],
//     answer: String, // có thể mở rộng cho nhiều đáp án
//   },

//   matching: {
//     question: String,
//     items: [String], // danh sách các mục cần nối
//     options: [String], // danh sách mô tả
//     correctMatches: [String], // các đáp án đúng, theo thứ tự
//   },

//   planMapDiagramLabelling: {
//     diagramUrl: String,
//     labels: [String], // các nhãn cần điền
//     correctLabels: [String], // nhãn đúng
//   },

//   sentenceCompletion: {
//     sentenceWithBlank: String,
//     answer: String,
//     wordLimit: Number,
//   },

//   shortAnswer: {
//     question: String,
//     answer: String,
//     wordLimit: Number,
//   },

//   explanation: String,

//   difficulty: {
//     type: String,
//     enum: ["easy", "medium", "hard"],
//     default: "medium",
//     required: true,
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

const ListeningQuestionSchema = new mongoose.Schema({
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Part",
    required: true,
  },

  type: {
    type: String,
    enum: [
      "form_note_table_completion",
      "multiple_choice",
      "matching",
      "plan_map_diagram_labelling",
      "sentence_completion",
      "short_answer",
    ],
    required: true,
  },

  content: { type: String },

  // ✅ Thêm audio và image (URL tương đối)
  audio: { type: String },
  image: { type: String },

  formNoteTableCompletion: {
    instruction: String,
    blanks: [String],
    answers: [String],
    wordLimit: Number,
  },

  multipleChoice: {
    question: String,
    options: [String],
    answer: String,
  },

  matching: {
    question: String,
    items: [String],
    options: [String],
    correctMatches: [String],
  },

  planMapDiagramLabelling: {
    diagramUrl: String,
    labels: [String],
    correctLabels: [String],
  },

  sentenceCompletion: {
    sentenceWithBlank: String,
    answer: String,
    wordLimit: Number,
  },

  shortAnswer: {
    question: String,
    answer: String,
    wordLimit: Number,
  },

  explanation: String,

  difficulty: {
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
  "ListeningQuestion",
  ListeningQuestionSchema,
  "ListeningQuestions"
);
