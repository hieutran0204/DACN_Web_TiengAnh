// // const mongoose = require("mongoose");

// // const QuestionSchema = new mongoose.Schema({
// //   part: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: "Part",
// //     required: true,
// //   },

// //   type: {
// //     type: String,
// //     enum: [
// //       "multiple_choice",
// //       "true_false_not_given",
// //       "yes_no_not_given",
// //       "matching_headings",
// //       "matching_information",
// //       "matching_features",
// //       "matching_sentence_endings",
// //       "sentence_completion",
// //       "summary_completion",
// //       "diagram_label_completion",
// //     ],
// //     required: true,
// //   },

// //   content: { type: String }, // Nội dung chính (câu hỏi hoặc đoạn cần xử lý)

// //   // ----------- DỮ LIỆU RIÊNG TỪNG LOẠI CÂU HỎI -----------
// //   multipleChoice: {
// //     options: [String],
// //     answer: String,
// //   },

// //   trueFalseNotGiven: {
// //     statement: String,
// //     answer: {
// //       type: String,
// //       enum: ["True", "False", "Not Given"],
// //     },
// //   },

// //   yesNoNotGiven: {
// //     statement: String,
// //     answer: {
// //       type: String,
// //       enum: ["Yes", "No", "Not Given"],
// //     },
// //   },

// //   matchingHeadings: {
// //     paragraph: String,
// //     headings: [String],
// //     correctHeading: String,
// //   },

// //   matchingInformation: {
// //     infoText: String,
// //     paragraphLabel: String, // ví dụ: A, B, C,...
// //   },

// //   matchingFeatures: {
// //     item: String,
// //     features: [String], // danh sách các nhân vật/địa điểm,...
// //     matchedFeature: String,
// //   },

// //   matchingSentenceEndings: {
// //     start: String,
// //     endings: [String],
// //     correctEnding: String,
// //   },

// //   sentenceCompletion: {
// //     sentenceWithBlank: String,
// //     answer: String,
// //     wordLimit: Number,
// //   },

// //   summaryCompletion: {
// //     summaryText: String,
// //     blanks: [String], // danh sách ô trống
// //     answers: [String],
// //     wordLimit: Number,
// //   },

// //   diagramLabelCompletion: {
// //     diagramUrl: String,
// //     labels: [String], // ví dụ: ["1", "2", "3"]
// //     correctLabels: [String],
// //   },

// //   // ----------- CHUNG CHO MỌI LOẠI -----------
// //   explanation: String,

// //   // ✅ Thêm trường image để lưu URL ảnh (tương đối)
// //   image: { type: String },

// //   difficulty: {
// //     type: String,
// //     enum: ["easy", "medium", "hard"],
// //     default: "medium",
// //     required: true,
// //   },

// //   createdAt: {
// //     type: Date,
// //     default: Date.now,
// //   },
// // });

// // module.exports = mongoose.model(
// //   "ReadingQuestion",
// //   QuestionSchema,
// //   "ReadingQuestions"
// // );

// // backend/models/readingQuestion.model.js

// const mongoose = require("mongoose");

// const ReadingQuestionSchema = new mongoose.Schema({
//   // THAY ĐỔI LỚN: DÙNG passageNumber ĐỂ PHÂN BIỆT Passage 1, 2, 3
//   passageNumber: {
//     type: String,
//     enum: ["Passage 1", "Passage 2", "Passage 3"],
//     required: true,
//   },

//   type: {
//     type: String,
//     enum: [
//       "multiple_choice",
//       "true_false_not_given",
//       "yes_no_not_given",
//       "matching_headings",
//       "matching_information",
//       "matching_features",
//       "matching_sentence_endings",
//       "sentence_completion",
//       "summary_completion",
//       "diagram_label_completion",
//       "note_completion",
//       "table_completion",
//       "flow_chart_completion",
//     ],
//     required: true,
//   },

//   // ĐOẠN VĂN CHÍNH – BẮT BUỘC
//   passage: {
//     type: String,
//     required: true,
//     trim: true,
//   },

//   // HÌNH ẢNH (nếu có diagram, chart, map...)
//   image: { type: String },

//   // CÁC CÂU HỎI CON (sub-questions) – giống Listening
//   subQuestions: [
//     {
//       // Câu hỏi hoặc statement
//       question: { type: String, required: true },

//       // Dành cho: multiple_choice, matching, chọn đáp án
//       options: [String], // A, B, C, D hoặc các lựa chọn

//       // Dành cho: fill, sentence, summary, note, diagram...
//       correctAnswers: {
//         type: [String],
//         default: undefined,
//       },

//       // Cũ: dùng cho multiple_choice (giữ lại để tương thích)
//       correctAnswer: { type: String },

//       // Dành riêng cho matching headings
//       paragraphLabel: String, // A, B, C...
//       headings: [String],
//     },
//   ],

//   explanation: String,

//   difficulty: {
//     type: String,
//     enum: ["easy", "medium", "hard"],
//     default: "medium",
//   },

//   createdAt: { type: Date, default: Date.now },
// });

// // ==================== TỰ ĐỘNG CHUYỂN ĐỔI ĐÁP ÁN (SIÊU TIỆN) ====================
// ReadingQuestionSchema.pre("validate", function (next) {
//   const isFillType = [
//     "sentence_completion",
//     "summary_completion",
//     "note_completion",
//     "table_completion",
//     "flow_chart_completion",
//     "diagram_label_completion",
//   ].includes(this.type);

//   const isMultipleChoice = this.type === "multiple_choice";

//   this.subQuestions.forEach((sq) => {
//     if (isFillType) {
//       // Phải có correctAnswers (mảng)
//       if (!sq.correctAnswers || sq.correctAnswers.length === 0) {
//         if (sq.correctAnswer) {
//           sq.correctAnswers = [sq.correctAnswer.trim()];
//           sq.correctAnswer = undefined;
//         }
//       } else {
//         sq.correctAnswer = undefined; // xóa trường cũ
//       }
//     }

//     if (isMultipleChoice) {
//       // Chỉ dùng correctAnswer (1 đáp án)
//       if (Array.isArray(sq.correctAnswers) && sq.correctAnswers.length > 0) {
//         sq.correctAnswer = sq.correctAnswers[0];
//         sq.correctAnswers = undefined;
//       }
//       // Bắt buộc phải có correctAnswer
//       if (!sq.correctAnswer && sq.options?.length > 0) {
//         // có thể tự động set A nếu cần, hoặc để lỗi validate
//       }
//     }
//   });

//   next();
// });

// // Index để lấy nhanh theo passage
// ReadingQuestionSchema.index({ passageNumber: 1 });

// module.exports = mongoose.model(
//   "ReadingQuestion",
//   ReadingQuestionSchema,
//   "ReadingQuestions"
// );

const mongoose = require("mongoose");

const ReadingQuestionSchema = new mongoose.Schema(
  {
    // Chỉ cần biết thuộc Passage nào → đủ để ghép bài thi
    passageNumber: {
      type: String,
      enum: ["Passage 1", "Passage 2", "Passage 3"],
      required: true,
    },

    // ĐOẠN VĂN CHÍNH (bắt buộc)
    passage: {
      type: String,
      required: true,
      trim: true,
    },

    // Hình ảnh (diagram, chart, map, illustration...)
    image: {
      type: String, // lưu đường dẫn: /uploads/reading/image/xxx.png
    },

    // MỖI CÂU HỎI CON CÓ LOẠI RIÊNG → SIÊU LINH HOẠT
    subQuestions: [
      {
        // Loại câu hỏi của riêng câu này
        type: {
          type: String,
          required: true,
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
            "note_completion",
            "table_completion",
            "flow_chart_completion",
            "diagram_label_completion",
          ],
        },

        // Nội dung câu hỏi / statement
        question: {
          type: String,
          required: true,
          trim: true,
        },

        // === DÀNH CHO MULTIPLE CHOICE ===
        options: [String], // ["A. Option 1", "B. Option 2", ...]
        correctAnswer: String, // "A", "B", "C", "D"

        // === DÀNH CHO FILL / COMPLETION / MATCHING ===
        correctAnswers: [String], // ["London", "1995"] hoặc ["True"] hoặc ["v", "iii"]

        // === DÀNH CHO MATCHING HEADINGS ===
        headings: [String], // ["i", "ii", "iii", ...] hoặc nội dung heading

        // === THÔNG TIN BỔ SUNG (tuỳ chọn) ===
        paragraphLabel: String, // A, B, C... cho matching information
        wordLimit: Number, // giới hạn từ (nếu có)
      },
    ],

    // Giải thích chung cho cả passage (nếu cần)
    explanation: String,

    // Độ khó
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  { timestamps: true }
);

// =============================================================================
// TỰ ĐỘNG CHUẨN HOÁ DỮ LIỆU KHI SAVE (SIÊU TIỆN CHO FE)
// =============================================================================
ReadingQuestionSchema.pre("save", function (next) {
  this.subQuestions.forEach((sq) => {
    const t = sq.type;

    // 1. Multiple Choice → chỉ dùng correctAnswer
    if (t === "multiple_choice") {
      if (Array.isArray(sq.correctAnswers) && sq.correctAnswers.length > 0) {
        sq.correctAnswer = sq.correctAnswers[0];
        sq.correctAnswers = undefined;
      }
      // Bắt buộc có correctAnswer nếu có options
      if (sq.options && sq.options.length > 0 && !sq.correctAnswer) {
        sq.correctAnswer = "A"; // mặc định nếu quên chọn
      }
    }

    // 2. True/False/Not Given & Yes/No/Not Given → dùng correctAnswers
    if (t === "true_false_not_given" || t === "yes_no_not_given") {
      if (sq.correctAnswer) {
        sq.correctAnswers = [sq.correctAnswer];
        sq.correctAnswer = undefined;
      }
      if (!sq.correctAnswers || sq.correctAnswers.length === 0) {
        sq.correctAnswers = ["Not Given"]; // mặc định
      }
    }

    // 3. Các loại Completion → bắt buộc correctAnswers
    if (
      [
        "sentence_completion",
        "summary_completion",
        "note_completion",
        "table_completion",
        "flow_chart_completion",
        "diagram_label_completion",
      ].includes(t)
    ) {
      if (sq.correctAnswer) {
        sq.correctAnswers = [sq.correctAnswer];
        sq.correctAnswer = undefined;
      }
      // Không bắt buộc có đáp án khi tạo (có thể thêm sau), nhưng nếu có thì phải là mảng
      if (!Array.isArray(sq.correctAnswers)) {
        sq.correctAnswers = [];
      }
    }

    // 4. Matching Headings
    if (t === "matching_headings") {
      if (!Array.isArray(sq.headings)) sq.headings = [];
    }
  });

  next();
});

// Index tìm nhanh theo passage
ReadingQuestionSchema.index({ passageNumber: 1 });

module.exports = mongoose.model(
  "ReadingQuestion",
  ReadingQuestionSchema,
  "ReadingQuestions"
);
