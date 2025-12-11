
const router = require("express").Router();
const { verifyToken } = require("../../../middlewares/auth");
const WritingSubmission = require("../../../models/Submission.model");

// Chuẩn hóa grammar_errors_found thành array string
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

// ======================= NỘP BÀI WRITING =======================
router.post("/submit", verifyToken, async (req, res) => {
  try {
    const {
      examId,
      task1Question,
      task1Type,
      task1Image,
      task1Answer,
      task2Question,
      task2Type,
      task2Answer,
    } = req.body;

    const userId = req.user._id;

    if (!task1Answer?.trim() || !task2Answer?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng hoàn thành cả Task 1 và Task 2",
      });
    }

    // Gọi AI Core chấm bài
    const [task1Res, task2Res] = await Promise.all([
      fetch("http://localhost:5000/api/ai/score/writing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.SERVICE_API_KEY,
        },
        body: JSON.stringify({
          essay: task1Answer,
          question: task1Question || "",
          type: task1Type || "ielts-task1",
        }),
      }).then((r) => r.json()),

      fetch("http://localhost:5000/api/ai/score/writing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.SERVICE_API_KEY,
        },
        body: JSON.stringify({
          essay: task2Answer,
          question: task2Question || "",
          type: task2Type || "ielts-task2",
        }),
      }).then((r) => r.json()),
    ]);

    // Kiểm tra lỗi từ AI
    if (task1Res.error || task2Res.error) {
      console.error("AI Core error:", task1Res, task2Res);
      return res.status(500).json({
        success: false,
        message: "AI chấm bài lỗi. Thử lại sau.",
      });
    }

    // Lấy điểm số và chuẩn hóa grammar errors
    const data1 = task1Res.data || task1Res;
    const data2 = task2Res.data || task2Res;

    const band1 = data1.overall_band || 0;
    const band2 = data2.overall_band || 0;
    const overallBand = Math.round(((band1 + band2 * 2) / 3) * 10) / 10;

    // Lưu bài nộp vào DB
    const submission = await WritingSubmission.create({
      user: userId,
      exam: examId,
      overallBand,
      task1: {
        question: task1Question || "",
        type: task1Type || "ielts-task1",
        image: task1Image || null,
        answer: task1Answer,
        result: {
          ...data1,
          overall_band: band1,
          grammar_errors_found: normalizeGrammarErrors(
            data1.grammar_errors_found
          ),
        },
      },
      task2: {
        question: task2Question || "",
        type: task2Type || "ielts-task2",
        answer: task2Answer,
        result: {
          ...data2,
          overall_band: band2,
          grammar_errors_found: normalizeGrammarErrors(
            data2.grammar_errors_found
          ),
        },
      },
    });

    return res.json({
      success: true,
      data: {
        resultId: submission._id,
        overallBand,
        task1: submission.task1.result,
        task2: submission.task2.result,
      },
      message: "Nộp bài thành công!",
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
      .select("exam overallBand submittedAt task1.result task2.result")
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
    }).populate("exam", "title");

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

module.exports = router;
