

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
