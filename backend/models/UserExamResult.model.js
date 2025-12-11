const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userExamResultSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", default: null }, // Null nếu là guest (nếu cần tracking guest)
  examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answers: [
    {
      questionId: { type: Schema.Types.ObjectId, required: true },
      userAnswer: { type: String }, // Câu trả lời của user
      isCorrect: { type: Boolean }, // Đúng hay sai
      correctAnswer: { type: String }, // Đáp án đúng (lưu lại để tiện review sau này nếu đề đổi)
      maxPoints: { type: Number, default: 1 },
    },
  ],
  completedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserExamResult", userExamResultSchema);
