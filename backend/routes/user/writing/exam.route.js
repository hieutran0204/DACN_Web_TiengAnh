
const router = require("express").Router();
const { verifyToken } = require("../../../middlewares/auth");
const WritingSubmission = require("../../../models/Submission.model");
const RawEssay         = require("../../../models/RawEssay.model");
const WritingQuestion  = require("../../../models/writingQuestion.model");

// Normalize grammar_errors_found to string array
const normalizeGrammarErrors = (errors) => {
  if (!Array.isArray(errors)) return [];
  return errors
    .map((err) => {
      if (typeof err === "string") return err;
      if (err && typeof err === "object") {
        return err.error || err.text || err.message || "Lỗi ngữ pháp";
      }
      return null;
    })
    .filter(Boolean);
};

// ======================= NỘP BÀI WRITING (DECOUPLED) =======================
/**
 * POST /submit
 * Submit a single writing task for async AI grading.
 * Body: { examId, questionId, answer, taskType }
 */
router.post("/submit", verifyToken, async (req, res) => {
  try {
    const { examId, questionId, answer, taskType } = req.body;
    const userId = req.user._id;

    if (!answer?.trim() || !questionId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu nội dung bài làm hoặc ID câu hỏi",
      });
    }

    // ── 1. Fetch question text from DB (required for TR detection) ──────────
    // Without the actual question, TopicRelevanceService receives "" and returns
    // verdict=NO_QUESTION, making the entire TR Hard Cap system a no-op.
    let questionText = "";
    let resolvedType = taskType || "ielts-task2";
    try {
      const questionDoc = await WritingQuestion.findById(questionId).select("question type task").lean();
      if (questionDoc) {
        questionText  = questionDoc.question || "";
        // Use question's own type if caller didn't send one (more reliable)
        resolvedType  = taskType || questionDoc.type || questionDoc.task || "ielts-task2";
      } else {
        console.warn(`[AI-Async] WritingQuestion not found for id: ${questionId}. TR detection will be skipped.`);
      }
    } catch (fetchErr) {
      // Non-fatal: log and proceed without question text
      console.warn(`[AI-Async] Could not fetch question text: ${fetchErr.message}. TR detection will be skipped.`);
    }

    // ── 2. Persist raw essay ────────────────────────────────────────────────
    const rawEssay = await RawEssay.create({
      user:     userId,
      question: questionId,
      exam:     examId || null,
      content:  answer,
      taskType: resolvedType,
      status:   "processing",
    });

    // ── 3. Create submission record (status: processing) ───────────────────
    const submission = await WritingSubmission.create({
      user:     userId,
      exam:     examId || null,
      question: questionId,
      answer:   answer,
      status:   "processing",
      result:   {},
    });

    // ── 4. Fire-and-forget AI grading (background) ─────────────────────────
    // Returns immediately to client; AI result is written back via DB update.
    (async () => {
      try {
        console.log(`[AI-Async] Grading submission ${submission._id} | question="${questionText.slice(0, 60)}..."`);
        const axios = require("axios");
        const aiResponse = await axios.post(
          "http://localhost:5000/api/ai/score/writing",
          {
            essay:     answer,
            question:  questionText,   // ✅ actual question text — enables TR detection
            type:      resolvedType,
            studentId: userId,
            essayId:   rawEssay._id,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key":    process.env.SERVICE_API_KEY,
            },
            timeout: 6000000, // 100 min — local GPU constraint
          }
        );

        const aiResult = aiResponse.data;

        if (aiResult.success) {
          const data = aiResult.data;
          await WritingSubmission.findByIdAndUpdate(submission._id, {
            status: "completed",
            result: {
              ...data,
              grammar_errors_found: normalizeGrammarErrors(data.grammar_errors_found),
            },
          });
          rawEssay.status = "completed";
          await rawEssay.save();
          console.log(`[AI-Async] ✅ Grading complete for submission ${submission._id}`);
        } else {
          throw new Error("AI Core returned success=false");
        }
      } catch (err) {
        console.error(`[AI-Async] ❌ Background grading failed:`, err.message);
        await WritingSubmission.findByIdAndUpdate(submission._id, { status: "failed" });
        rawEssay.status = "failed";
        await rawEssay.save();
      }
    })();

    // ── 5. Return immediately to frontend ──────────────────────────────────
    return res.json({
      success: true,
      data: {
        resultId: submission._id,
        status:   "processing",
      },
      message: "Bài làm đã được gửi đi chấm!",
    });
  } catch (err) {
    console.error("Lỗi nộp bài Writing:", err);
    return res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});



// ======================= LẤY LỊCH SỬ =======================
router.get("/my-submissions", verifyToken, async (req, res) => {
  try {
    const submissions = await WritingSubmission.find({ user: req.user._id })
      .populate("exam", "title")
      .populate("question", "task type topic")
      .sort({ submittedAt: -1 });

    res.json({ success: true, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi tải lịch sử" });
  }
});

// ======================= XEM CHI TIẾT =======================
router.get("/submission/:id", verifyToken, async (req, res) => {
  try {
    const submission = await WritingSubmission.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("exam", "title")
      .populate("question");

    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài làm" });
    }

    res.json({ success: true, data: submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// ======================= DASHBOARD NĂNG LỰC (GRAPHRAG) =======================
/**
 * GET /api/user/writing-exam/dashboard
 * Tổng hợp dữ liệu từ Neo4j Graph để FE vẽ chart chân dung học viên
 */
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Gọi sang AI Core Microservice để lấy Graph Profile
    const aiResponse = await fetch(`http://localhost:5000/api/graph/student-profile/${userId}`, {
      method: "GET",
      headers: {
        "x-api-key": process.env.SERVICE_API_KEY,
      },
    });

    const aiResult = await aiResponse.json();

    if (aiResult.success) {
      return res.json({
        success: true,
        data: aiResult.data,
      });
    } else {
      // Nếu chưa có dữ liệu graph (mới làm bài đầu tiên chẳng hạn)
      return res.json({
        success: true,
        data: {
          stats: { totalEssays: 0, topErrors: [], topStrengths: [], recentEssays: [] },
          message: "Chưa có đủ dữ liệu để phân tích chuyên sâu."
        }
      });
    }
  } catch (err) {
    console.error("Lỗi lấy Dashboard Writing:", err.message);
    res.status(500).json({ success: false, message: "Không thể kết nối với AI Core" });
  }
});

module.exports = router;
