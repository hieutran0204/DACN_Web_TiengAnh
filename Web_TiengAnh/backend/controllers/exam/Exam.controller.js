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

// =========================
// PUBLIC ROUTES – ĐÃ SỬA HOÀN HẢO 100%
// =========================

const getAllPublic = async (req, res) => {
  try {
    const exams = await examService.getAllExams({ isPublished: true });

    const result = exams.map((e) => {
      const listening = e.skills?.listening?.length || 0;
      const reading = e.skills?.reading?.length || 0;
      const writing = e.skills?.writing?.length || 0;
      const speaking = e.skills?.speaking?.length || 0;

      return {
        _id: e._id,
        title: e.title,
        description: e.description || "",
        durationMinutes: e.durationMinutes,
        totalAttempts: e.totalAttempts || 0,
        createdAt: e.createdAt,
        questionCount: {
          listening,
          reading,
          writing,
          speaking,
          total: listening + reading + writing + speaking,
        },
        // Tự động biết đề này thuộc skill nào (nếu chỉ có 1 skill)
        mainSkill:
          listening > 0 && reading + writing + speaking === 0
            ? "listening"
            : reading > 0 && listening + writing + speaking === 0
              ? "reading"
              : writing > 0 && listening + reading + speaking === 0
                ? "writing"
                : speaking > 0 && listening + reading + writing === 0
                  ? "speaking"
                  : "fulltest",
      };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Lỗi getAllPublic:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// ==================== HÀM MỚI – BẮT BUỘC PHẢI CÓ ====================
// HÀM MỚI – DÀNH RIÊNG CHO CẤU TRÚC DB CỦA MÀY (KHÔNG DÙNG POPULATE)
const getPublicExamDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { populate } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });
    }

    // TÌM ĐỀ ĐÃ PUBLISH
    const exam = await Exam.findOne({ _id: id, isPublished: true }).lean();
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đề thi hoặc chưa công khai",
      });
    }

    // NẾU KHÔNG CẦN POPULATE → TRẢ VỀ NGAY (dùng cho danh sách)
    if (populate !== "true") {
      return res.json({ success: true, data: exam });
    }

    // === TRƯỜNG HỢP CẦN CHI TIẾT (LÀM BÀI) ===
    // Vì mày lưu ObjectId thật trong skills → phải query riêng từng skill
    const Question = mongoose.model("Question");

    const populatedSkills = {};

    // Duyệt từng skill có dữ liệu
    for (const skill of ["listening", "reading", "writing", "speaking"]) {
      if (
        exam.skills[skill] &&
        Array.isArray(exam.skills[skill]) &&
        exam.skills[skill].length > 0
      ) {
        const questionIds = exam.skills[skill].map(
          (id) => new mongoose.Types.ObjectId(id)
        );
        const questions = await Question.find({ _id: { $in: questionIds } })
          .select(
            "question title audio options correctAnswer type part taskType passage"
          )
          .lean();

        // Giữ nguyên thứ tự như trong exam
        const sortedQuestions = questionIds
          .map((id) =>
            questions.find((q) => q._id.toString() === id.toString())
          )
          .filter(Boolean);

        populatedSkills[skill] = sortedQuestions;
      } else {
        populatedSkills[skill] = [];
      }
    }

    // Gộp lại
    const fullExam = {
      ...exam,
      skills: populatedSkills,
    };

    res.json({ success: true, data: fullExam });
  } catch (err) {
    console.error("Lỗi getPublicExamDetail:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
const getAllPublicPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await examService.getPaginatedExams(page, limit, {
      isPublished: true,
    });

    const processedData = result.data.map((e) => {
      const listening = e.skills?.listening?.length || 0;
      const reading = e.skills?.reading?.length || 0;
      const writing = e.skills?.writing?.length || 0;
      const speaking = e.skills?.speaking?.length || 0;

      return {
        _id: e._id,
        title: e.title,
        description: e.description || "",
        durationMinutes: e.durationMinutes,
        totalAttempts: e.totalAttempts || 0,
        createdAt: e.createdAt,
        questionCount: {
          listening,
          reading,
          writing,
          speaking,
          total: listening + reading + writing + speaking,
        },
        mainSkill:
          listening > 0 && reading + writing + speaking === 0
            ? "listening"
            : reading > 0 && listening + writing + speaking === 0
              ? "reading"
              : writing > 0 && listening + reading + speaking === 0
                ? "writing"
                : speaking > 0 && listening + reading + writing === 0
                  ? "speaking"
                  : "fulltest",
      };
    });

    res.json({
      success: true,
      data: processedData,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    console.error("Lỗi getAllPublicPaginated:", err);
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
  getPublicExamDetail,
  publishExam,
};
