// const Question = require("../models/readingQuestion.model");

// // Thêm câu hỏi mới
// exports.createQuestion = async (req, res) => {
//   try {
//     const question = await Question.create(req.body);
//     res.status(201).json(question);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Lấy danh sách tất cả câu hỏi
// exports.getAllQuestions = async (req, res) => {
//   try {
//     const questions = await Question.find().populate("section");
//     res.json(questions);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Lấy câu hỏi theo ID
// exports.getQuestionById = async (req, res) => {
//   try {
//     const question = await Question.findById(req.params.id).populate("section");
//     if (!question) return res.status(404).json({ error: "Question not found" });
//     res.json(question);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Xóa câu hỏi
// exports.deleteQuestion = async (req, res) => {
//   try {
//     await Question.findByIdAndDelete(req.params.id);
//     res.json({ message: "Question deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
