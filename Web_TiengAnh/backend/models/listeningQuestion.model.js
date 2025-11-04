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

//   content: { type: String },

//   // ✅ Thêm audio và image (URL tương đối)
//   audio: { type: String },
//   image: { type: String },

//   formNoteTableCompletion: {
//     instruction: String,
//     blanks: [String],
//     answers: [String],
//     wordLimit: Number,
//   },

//   multipleChoice: {
//     question: String,
//     options: [String],
//     answer: String,
//   },

//   matching: {
//     question: String,
//     items: [String],
//     options: [String],
//     correctMatches: [String],
//   },

//   planMapDiagramLabelling: {
//     diagramUrl: String,
//     labels: [String],
//     correctLabels: [String],
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
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },

  type: {
    type: String,
    enum: [
      "form_note_table_completion",
      "summary_completion",
      "multiple_choice_single",
      "multiple_choice_multiple",
      "matching",
      "plan_map_diagram_labelling",
      "sentence_completion",
      "short_answer",
    ],
    required: true,
  },

  title: String,
  content: String,
  instruction: String,

  audio: { type: String, required: true },
  image: { type: String },

  subQuestions: [
    {
      questionNumber: Number,
      question: String,
      options: [String],
      correctAnswers: [String],
      wordLimit: Number,
      label: String,
      correctLabel: String,
      note: String,
    },
  ],

  explanation: String,
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
  "ListeningQuestion",
  ListeningQuestionSchema,
  "ListeningQuestions"
);
