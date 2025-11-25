const mongoose = require("mongoose");
const examService = require("../../services/exam/Exam.service");

// =========================
// CRUD CHÍNH
// =========================

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

// =========================
// PUBLIC ROUTES
// =========================

const getAllPublic = async (req, res) => {
  try {
    const exams = await examService.getAllExams({ isPublished: true });
    res.json({
      success: true,
      data: exams.map((e) => ({
        _id: e._id,
        title: e.title,
        description: e.description,
        durationMinutes: e.durationMinutes,
        createdAt: e.createdAt,
        totalQuestions: Object.values(e.skills).flat().length,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllPublicPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await examService.getPaginatedExams(page, limit, {
      isPublished: true,
    });

    res.json({
      success: true,
      data: result.data.map((e) => ({
        _id: e._id,
        title: e.title,
        description: e.description,
        durationMinutes: e.durationMinutes,
        createdAt: e.createdAt,
        totalQuestions: Object.values(e.skills).flat().length,
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

const getPublicById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "ID không hợp lệ" });
  }

  try {
    const exam = await examService.getExamById(req.params.id);

    if (!exam)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đề thi" });

    if (!exam.isPublished) {
      return res
        .status(403)
        .json({ success: false, message: "Đề thi chưa được công khai" });
    }

    res.json({ success: true, data: exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const publishExam = async (req, res) => {
  try {
    const exam = await examService.updateExam(req.params.id, {
      isPublished: true,
    });

    res.json({
      success: true,
      message: "Đã công khai đề thi!",
      data: exam,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =========================
// EXPORT
// =========================

module.exports = {
  create,
  getAll,
  getAllPaginated,
  getById,
  updateExam,
  deleteExam,

  // public APIs
  getAllPublic,
  getAllPublicPaginated,
  getPublicById,
  publishExam,
};
