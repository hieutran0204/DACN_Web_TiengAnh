// const mongoose = require("mongoose");
// const examService = require("../../services/exam/Exam.service");

// class ExamController {
//   async create(req, res) {
//     try {
//       const exam = await examService.createExam(req.body);
//       res.status(201).json({ success: true, data: exam });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   async getAll(req, res) {
//     try {
//       const exams = await examService.getAllExams();
//       res.status(200).json({
//         success: true,
//         data: exams.map((e) => ({
//           _id: e._id,
//           title: e.title,
//           description: e.description,
//           durationMinutes: e.durationMinutes,
//           createdAt: e.createdAt,
//         })),
//       });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   async getById(req, res) {
//     console.log("ID received:", req.params.id); // Debug
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "ID không hợp lệ" });
//     }
//     try {
//       const exam = await examService.getExamById(req.params.id);
//       res.status(200).json({ success: true, data: exam });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   async updateExam(req, res) {
//     console.log("Updating exam with ID:", req.params.id); // Debug
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "ID không hợp lệ" });
//     }
//     try {
//       const updatedExam = await examService.updateExam(req.params.id, req.body);
//       res.status(200).json({ success: true, data: updatedExam });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   async delete(req, res) {
//     console.log("ID received:", req.params.id); // Debug
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "ID không hợp lệ" });
//     }
//     try {
//       await examService.deleteExam(req.params.id);
//       res.status(204).end();
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   async getAllPaginated(req, res) {
//     try {
//       const page = parseInt(req.query.page) || 1;
//       const limit = parseInt(req.query.limit) || 10;

//       const result = await examService.getPaginatedExams(page, limit);

//       res.status(200).json({
//         success: true,
//         data: result.data.map((e) => ({
//           _id: e._id,
//           title: e.title,
//           description: e.description,
//           durationMinutes: e.durationMinutes,
//           createdAt: e.createdAt,
//           skills: {
//             listening: e.skills.listening,
//             reading: e.skills.reading,
//             speaking: e.skills.speaking,
//             writing: e.skills.writing,
//           },
//         })),
//         total: result.total,
//         page: result.page,
//         limit: result.limit,
//         totalPages: result.totalPages,
//         hasNextPage: page < result.totalPages,
//         hasPrevPage: page > 1,
//       });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }
// }

// module.exports = new ExamController();

// controllers/exam/Exam.controller.js

const mongoose = require("mongoose");
const examService = require("../../services/exam/Exam.service");

// ✅ XUẤT TRỰC TIẾP CÁC HÀM (DỄ DÙNG NHẤT!)
const create = async (req, res) => {
  try {
    const exam = await examService.createExam(req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const exams = await examService.getAllExams();
    res.json({
      success: true,
      data: exams.map((e) => ({
        _id: e._id,
        title: e.title,
        description: e.description,
        durationMinutes: e.durationMinutes,
        createdAt: e.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await examService.getPaginatedExams(page, limit);

    res.json({
      success: true,
      data: result.data.map((e) => ({
        _id: e._id,
        title: e.title,
        description: e.description,
        durationMinutes: e.durationMinutes,
        createdAt: e.createdAt,
      })),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "ID không hợp lệ" });
  }
  try {
    const exam = await examService.getExamById(req.params.id);
    if (!exam)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy" });
    res.json({ success: true, data: exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateExam = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "ID không hợp lệ" });
  }
  try {
    const exam = await examService.updateExam(req.params.id, req.body);
    if (!exam)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy" });
    res.json({ success: true, data: exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteExam = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "ID không hợp lệ" });
  }
  try {
    await examService.deleteExam(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// XUẤT ĐÚNG TÊN
module.exports = {
  create,
  getAll,
  getAllPaginated,
  getById,
  updateExam,
  delete: deleteExam,
};
