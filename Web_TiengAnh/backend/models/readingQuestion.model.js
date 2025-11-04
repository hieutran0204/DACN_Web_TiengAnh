const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Part",
    required: true,
  },

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

  content: { type: String }, // Nội dung chính (câu hỏi hoặc đoạn cần xử lý)

  // ----------- DỮ LIỆU RIÊNG TỪNG LOẠI CÂU HỎI -----------
  multipleChoice: {
    options: [String],
    answer: String,
  },

  trueFalseNotGiven: {
    statement: String,
    answer: {
      type: String,
      enum: ["True", "False", "Not Given"],
    },
  },

  yesNoNotGiven: {
    statement: String,
    answer: {
      type: String,
      enum: ["Yes", "No", "Not Given"],
    },
  },

  matchingHeadings: {
    paragraph: String,
    headings: [String],
    correctHeading: String,
  },

  matchingInformation: {
    infoText: String,
    paragraphLabel: String, // ví dụ: A, B, C,...
  },

  matchingFeatures: {
    item: String,
    features: [String], // danh sách các nhân vật/địa điểm,...
    matchedFeature: String,
  },

  matchingSentenceEndings: {
    start: String,
    endings: [String],
    correctEnding: String,
  },

  sentenceCompletion: {
    sentenceWithBlank: String,
    answer: String,
    wordLimit: Number,
  },

  summaryCompletion: {
    summaryText: String,
    blanks: [String], // danh sách ô trống
    answers: [String],
    wordLimit: Number,
  },

  diagramLabelCompletion: {
    diagramUrl: String,
    labels: [String], // ví dụ: ["1", "2", "3"]
    correctLabels: [String],
  },

  // ----------- CHUNG CHO MỌI LOẠI -----------
  explanation: String,

  // ✅ Thêm trường image để lưu URL ảnh (tương đối)
  image: { type: String },

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
  "ReadingQuestion",
  QuestionSchema,
  "ReadingQuestions"
);
