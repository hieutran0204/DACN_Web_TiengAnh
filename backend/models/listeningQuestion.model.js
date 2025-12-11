// const mongoose = require("mongoose");

// const ListeningQuestionSchema = new mongoose.Schema({
//   section: {
//     type: String,
//     enum: ["Section 1", "Section 2", "Section 3", "Section 4"], // PHẢI CÓ DẤU CÁCH!!!
//     required: true,
//   },
//   type: {
//     type: String,
//     enum: [
//       "multiple_choice",
//       "fill_in_the_blank",
//       "matching",
//       "note_completion",
//       "sentence_completion",
//     ],
//     required: true,
//   },
//   title: { type: String, required: true },
//   audio: { type: String, required: true },
//   transcript: String,
//   explanation: String,
//   subQuestions: [
//     {
//       question: { type: String, required: true },
//       correctAnswer: { type: String, required: true },
//       options: [String],
//     },
//   ],
//   difficulty: {
//     type: String,
//     enum: ["easy", "medium", "hard"],
//     default: "medium",
//   },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("ListeningQuestion", ListeningQuestionSchema);

const mongoose = require("mongoose");

const ListeningQuestionSchema = new mongoose.Schema({
  section: {
    type: String,
    enum: ["Section 1", "Section 2", "Section 3", "Section 4"],
    required: true,
  },
  type: {
    type: String,
    enum: [
      "multiple_choice",
      "fill_in_the_blank",
      "matching",
      "note_completion",
      "sentence_completion",
    ],
    required: true,
  },
  title: { type: String, required: true },
  audio: { type: String, required: true },
  transcript: String,
  explanation: String,

  // ĐÃ SỬA HOÀN TOÀN TẠI ĐÂY
  subQuestions: [
    {
      question: { type: String, required: true },

      // Cũ (Multiple Choice, Matching cũ) → vẫn hỗ trợ để không lỗi dữ liệu cũ
      correctAnswer: { type: String }, // không required nữa

      // MỚI – DÀNH CHO fill_in_the_blank, note_completion, sentence_completion
      correctAnswers: {
        type: [String],
        default: undefined,
        // Chỉ bắt buộc khi type không phải multiple_choice
      },

      // Dành cho multiple_choice
      options: [String],

      // Dành cho matching (nếu cần lưu riêng)
      matchingOptions: [String],
    },
  ],

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  createdAt: { type: Date, default: Date.now },
});

// ==================== VIRTUAL + MIDDLEWARE ĐỂ TỰ ĐỘNG CHUYỂN ĐỔI (TÙY CHỌN) ====================
// Nếu bạn muốn tự động chuyển correctAnswer → correctAnswers hoặc ngược lại (rất tiện)

ListeningQuestionSchema.pre("validate", function (next) {
  // Với fill/note/sentence: phải có correctAnswers (mảng)
  if (
    ["fill_in_the_blank", "note_completion", "sentence_completion"].includes(
      this.type
    )
  ) {
    this.subQuestions.forEach((sq) => {
      if (sq.correctAnswers && sq.correctAnswers.length > 0) {
        // Đã có mảng → bỏ correctAnswer cũ
        sq.correctAnswer = undefined;
      } else if (sq.correctAnswer) {
        // Nếu vẫn gửi kiểu cũ → tự động chuyển thành mảng
        sq.correctAnswers = [sq.correctAnswer];
        sq.correctAnswer = undefined;
      } else {
        // Không có gì → lỗi validate sẽ tự báo
      }
    });
  }

  // Với multiple_choice: chỉ dùng correctAnswer (1 đáp án A/B/C/D)
  if (this.type === "multiple_choice") {
    this.subQuestions.forEach((sq) => {
      if (Array.isArray(sq.correctAnswers) && sq.correctAnswers.length > 0) {
        sq.correctAnswer = sq.correctAnswers[0]; // lấy cái đầu
        sq.correctAnswers = undefined;
      }
    });
  }

  next();
});

module.exports = mongoose.model("ListeningQuestion", ListeningQuestionSchema);
