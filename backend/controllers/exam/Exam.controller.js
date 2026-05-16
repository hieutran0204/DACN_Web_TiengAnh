const mongoose = require("mongoose");
const examService = require("../../services/exam/Exam.service");
const Exam = require("../../models/exam.model");
const UserExamResult = require("../../models/UserExamResult.model");

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
        isPublished: e.isPublished,
        createdAt: e.createdAt,
        questionCount: {
          listening: e.skills?.listening?.length || 0,
          reading: e.skills?.reading?.length || 0,
          writing: e.skills?.writing?.length || 0,
          speaking: e.skills?.speaking?.length || 0,
        },
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
    const populatedSkills = {};

    // Map skill name to Model Name
    const modelMap = {
      listening: "ListeningQuestion",
      reading: "ReadingQuestion",
      writing: "WritingQuestion",
      speaking: "SpeakingQuestion"
    };

    // Duyệt từng skill có dữ liệu
    for (const skill of ["listening", "reading", "writing", "speaking"]) {
      if (
        exam.skills[skill] &&
        Array.isArray(exam.skills[skill]) &&
        exam.skills[skill].length > 0
      ) {
        const ModelName = modelMap[skill];
        // Ensure model is registered or used safely
        // Better to rely on mongoose.model() if models are loaded. 
        // If not loaded, we might need to require them. 
        // Assuming models are loaded via index.js or similar. 
        // If error persists, we will require them top-level.
        
        let QuestionModel;
        try {
           QuestionModel = mongoose.model(ModelName);
        } catch (e) {
           // Fallback: This effectively requires the model if not registered.
           // You might need to adjust paths if directory structure changes.
           const skillFileMap = {
              listening: "listeningQuestion.model",
              reading: "readingQuestion.model",
              writing: "writingQuestion.model",
              speaking: "speakingQuestion.model"
           };
           require(`../../models/${skillFileMap[skill]}`);
           QuestionModel = mongoose.model(ModelName);
        }

        const questionIds = exam.skills[skill].map(
          (id) => new mongoose.Types.ObjectId(id)
        );
        const questions = await QuestionModel.find({ _id: { $in: questionIds } })
          .select(
            "question title audio options type part taskType passage isUnknown subQuestions"
          )
          .lean();

        // Ẩn đáp án đúng
        const sanitizedQuestions = questions.map((q) => {
          // Xóa các trường chứa đáp án logic chung
          delete q.correctAnswer;
          delete q.correctAnswers;
          
          if (q.subQuestions && Array.isArray(q.subQuestions)) {
            q.subQuestions = q.subQuestions.map((sq) => {
              // Deep clone to avoid mutating if needed, but .lean() helps
              const { correctAnswer, correctAnswers, ...rest } = sq;
              return rest;
            });
          }
          return q;
        });

        // Giữ nguyên thứ tự như trong exam
        const sortedQuestions = questionIds
          .map((id) =>
            sanitizedQuestions.find((q) => q._id.toString() === id.toString())
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

const submitExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body; // { questionId: answerString }
    const userId = req.user ? req.user._id : null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }

    const exam = await Exam.findById(id).lean();
    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    const allQuestions = [];
    const modelMap = {
      listening: "ListeningQuestion",
      reading: "ReadingQuestion",
      writing: "WritingQuestion",
      speaking: "SpeakingQuestion"
    };

    // Gather all questions from all skills
    for (const skill of ["listening", "reading", "writing", "speaking"]) {
       if (exam.skills[skill] && exam.skills[skill].length > 0) {
          const ModelName = modelMap[skill];
           let QuestionModel;
            try {
               QuestionModel = mongoose.model(ModelName);
            } catch (e) {
               const skillFileMap = {
                  listening: "listeningQuestion.model",
                  reading: "readingQuestion.model",
                  writing: "writingQuestion.model",
                  speaking: "speakingQuestion.model"
               };
               try {
                  require(`../../models/${skillFileMap[skill]}`);
                  QuestionModel = mongoose.model(ModelName);
               } catch (reqErr) {
                  console.error(`Failed to load model for ${skill}:`, reqErr);
                  continue; // Skip this skill if model fails
               }
            }

           const skillIds = exam.skills[skill];
           const skillQuestions = await QuestionModel.find({ _id: { $in: skillIds } }).lean();
           allQuestions.push(...skillQuestions);
       }
    }
    
    // DEBUG QUESTIONS FOUND
    console.log(`[INFO] Questions found in DB: ${allQuestions.length}`);

    let score = 0;
    let totalQuestions = 0;
    const resultDetails = [];

    // Duyệt qua tất cả câu hỏi trong bài thi
    for (const q of allQuestions) {
      if (q.subQuestions && q.subQuestions.length > 0) {
        for (const sq of q.subQuestions) {
          totalQuestions++;
          
          if (!sq._id) {
             console.log(`[WARN] SubQuestion missing _id inside Question ${q._id}`);
             console.log(`[WARN] SubQuestion Item:`, JSON.stringify(sq, null, 2));
             // Fallback: Check if there's an 'id' instead of '_id'
             if (sq.id) {
                console.log(`[INFO] Found 'id' property: ${sq.id}. Using it as _id.`);
                sq._id = sq.id;
             } else {
                 continue;
             }
          }

          const subQId = sq._id.toString();
          const userAnswer = answers[subQId] ? answers[subQId].trim() : "";
          let isCorrect = false;

          // DEBUG
          // console.log(`[GRADING] Processing ${subQId}. User Answer: "${userAnswer}"`);

          // LOGIC CHỌN ĐÁP ÁN ĐÚNG (Ưu tiên mảng, nếu rỗng thì dùng string)
          let validAnswers = [];
          if (Array.isArray(sq.correctAnswers) && sq.correctAnswers.length > 0) {
            validAnswers = sq.correctAnswers;
          } else if (sq.correctAnswer) {
            validAnswers = [sq.correctAnswer];
          }

          // Chuẩn hóa danh sách đáp án đúng
          const normalizedCorrectAnswers = validAnswers.map((a) =>
            (a !== null && a !== undefined) ? a.toString().trim().toLowerCase() : ""
          ).filter(a => a !== "");

          // Chuẩn hóa câu trả lời của user
          let normalizedUserAnswer = userAnswer.toLowerCase();

          // MAP USER ANSWER CONTENT -> KEY (A, B, C...) if applicable
          // Nếu user gửi nội dung ("Cat") mà đáp án là Key ("A")
          if (sq.options && Array.isArray(sq.options)) {
             // Safe map
             const lowerOptions = sq.options.map(o => (o !== null && o !== undefined) ? o.toString().trim().toLowerCase() : "");
             const optionIndex = lowerOptions.findIndex(o => o === normalizedUserAnswer);
             
             if (optionIndex !== -1) {
                // User gửi đúng nội dung của 1 option => Convert sang key correspondence (0->a, 1->b...)
                const key = String.fromCharCode(97 + optionIndex); // 97 = 'a'
                // Thử check xem key này có trong correctAnswers không
                if (normalizedCorrectAnswers.includes(key)) {
                    isCorrect = true;
                }
             }
          }

          // 1. So sánh chính xác (Exact Match)
          if (!isCorrect && normalizedCorrectAnswers.includes(normalizedUserAnswer)) {
            isCorrect = true;
          } else if (!isCorrect) {
            // 2. So sánh tương đối (Loose Match)
            for (const ca of normalizedCorrectAnswers) {
              if (
                normalizedUserAnswer.startsWith(ca + ".") ||
                normalizedUserAnswer.startsWith(ca + " ") ||
                ca.startsWith(normalizedUserAnswer + ".") ||
                ca.startsWith(normalizedUserAnswer + " ")
              ) {
                isCorrect = true;
                break;
              }
            }
          }

          if (isCorrect) {
            score++;
          }
          
          resultDetails.push({
            questionId: sq._id,
            userAnswer,
            isCorrect,
            correctAnswer: (validAnswers[0] || "").toString(), // Ensure string
            maxPoints: 1,
            // explanation: sq.explanation // Removed to avoid schema mismatch if strict
          });
        }
      }
    }

    // Lưu kết quả
    const result = new UserExamResult({
      userId,
      examId: id,
      score,
      totalQuestions,
      answers: resultDetails,
    });

    await result.save();

    res.json({
      success: true,
      data: {
        score,
        totalQuestions,
        resultId: result._id,
        details: resultDetails,
      },
    });

  } catch (err) {
    console.error("Submit error details:", err);
    res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
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
  submitExam, // NEW
};
