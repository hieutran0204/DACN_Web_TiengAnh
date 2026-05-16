const mongoose = require("mongoose");
const UserExamResult = require("../../models/UserExamResult.model");
const WritingSubmission = require("../../models/Submission.model");

class HistoryController {
  // Lấy danh sách tổng hợp tất cả điểm của User
  async getMyHistory(req, res) {
    try {
      const userId = req.user._id;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Không xác định được user" });
      }

      // 1. Lấy tất cả lịch sử thi chung (Thường là Reading/Listening/Full Test từ UserExamResult)
      const examResults = await UserExamResult.find({ userId })
        .populate("examId", "title description")
        .sort({ completedAt: -1 })
        .lean();

      // Format lại data cho examResults
      const formattedExams = examResults.map((result) => ({
        _id: result._id,
        type: "exam",
        examTitle: result.examId ? result.examId.title : "Đề thi đã bị xóa",
        score: result.score,
        totalQuestions: result.totalQuestions,
        completedAt: result.completedAt,
      }));

      // 2. Lấy tất cả lịch sử bài Writing (Có chấm bằng AI)
      const writingResults = await WritingSubmission.find({ user: userId })
        .populate("exam", "title")
        .sort({ submittedAt: -1 })
        .lean();

      // Format lại data cho writingResults
      const formattedWritings = writingResults.map((result) => ({
        _id: result._id,
        type: "writing",
        examTitle: result.exam ? result.exam.title : "Bài Writing tự do",
        score: result.result?.overall_band || 0, 
        completedAt: result.submittedAt,
        // Preview nội dung câu hỏi
        task1Preview: result.answer ? result.answer.substring(0, 100) + "..." : "",
      }));

      // 3. Gộp tất cả lại và sắp xếp theo ngày tháng mới nhất
      const historyList = [...formattedExams, ...formattedWritings].sort((a, b) => {
        return new Date(b.completedAt) - new Date(a.completedAt);
      });

      res.status(200).json({
        success: true,
        data: historyList,
      });
    } catch (err) {
      console.error("Lỗi getMyHistory:", err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Lấy chi tiết lịch sử 1 bài chung (UserExamResult)
  async getExamHistoryDetail(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "ID không hợp lệ" });
      }

      const result = await UserExamResult.findOne({ _id: id, userId })
        .populate("examId", "title description durationMinutes")
        .lean();

      if (!result) {
        return res.status(404).json({ success: false, message: "Không tìm thấy kết quả test này." });
      }

      // Xử lý parse JSON feedback nếu có trong correctAnswer (giống logic controller cũ)
      const formattedAnswers = result.answers.map((a) => {
        let feedback = null;
        try {
          if (a.correctAnswer && typeof a.correctAnswer === "string" && a.correctAnswer.startsWith("{")) {
            feedback = JSON.parse(a.correctAnswer);
          }
        } catch (e) {
          // ignore parsing error
        }
        return {
          ...a,
          feedback,
        };
      });

      res.status(200).json({
        success: true,
        data: {
          ...result,
          answers: formattedAnswers,
        },
      });
    } catch (err) {
      console.error("Lỗi getExamHistoryDetail:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Lấy chi tiết lịch sử bài Writing bằng AI
  async getWritingHistoryDetail(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "ID không hợp lệ" });
      }

      const result = await WritingSubmission.findOne({ _id: id, user: userId })
        .populate("exam", "title description")
        .populate("question", "question task type topic")
        .lean();

      if (!result) {
        return res.status(404).json({ success: false, message: "Không tìm thấy kết quả writing này." });
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      console.error("Lỗi getWritingHistoryDetail:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Lấy tổng quan AI Evaluated Profile (cho tab Overview)
  async getOverview(req, res) {
    try {
      const userId = req.user._id;

      // Tính tổng số test đã làm
      const examCount = await UserExamResult.countDocuments({ userId });
      const writingCount = await WritingSubmission.countDocuments({ user: userId });
      const totalCompleted = examCount + writingCount;

      // Lấy 10 bài Writing gần nhất để tổng hợp Strengths/Weaknesses
      const recentWritings = await WritingSubmission.find({ user: userId })
        .sort({ submittedAt: -1 })
        .limit(10)
        .lean();

      let writingAverage = 0;
      let strengthsMap = {};
      let weaknessesMap = {};

      if (recentWritings.length > 0) {
        const sumBand = recentWritings.reduce((acc, curr) => acc + (curr.result?.overall_band || 0), 0);
        writingAverage = (sumBand / recentWritings.length).toFixed(1);

        recentWritings.forEach(w => {
           if (w.result) {
              if (w.result.strengths) {
                 w.result.strengths.forEach(s => {
                    strengthsMap[s] = (strengthsMap[s] || 0) + 1;
                 });
              }
              if (w.result.weaknesses) {
                 w.result.weaknesses.forEach(wk => {
                    weaknessesMap[wk] = (weaknessesMap[wk] || 0) + 1;
                 });
              }
           }
        });
      }

      // Lấy top 4 điểm mạnh, điểm yếu xuất hiện nhiều nhất
      const topStrengths = Object.keys(strengthsMap).sort((a,b) => strengthsMap[b] - strengthsMap[a]).slice(0,4);
      const topWeaknesses = Object.keys(weaknessesMap).sort((a,b) => weaknessesMap[b] - weaknessesMap[a]).slice(0,4);

      // Điểm Average trắc nghiệm
      const examResults = await UserExamResult.find({ userId }).lean();
      let examAverage = 0;
      if (examResults.length > 0) {
         // Chấm theo thang %, rồi quy ra Band hoăc số thực, tuỳ
         const sumPercent = examResults.reduce((acc, curr) => {
            const pt = curr.totalQuestions > 0 ? (curr.score / curr.totalQuestions) * 100 : 0;
            return acc + pt;
         }, 0);
         examAverage = (sumPercent / examResults.length).toFixed(1) + "%";
      }

      res.status(200).json({
        success: true,
        data: {
           totalCompleted,
           writingAverage,
           examAverage,
           aiEvaluation: {
              strengths: topStrengths.length > 0 ? topStrengths : ["Cần làm thêm bài Writing để phân tích điểm mạnh"],
              weaknesses: topWeaknesses.length > 0 ? topWeaknesses : ["Cần làm thêm bài Writing để phân tích điểm yếu"],
              currentLevel: writingAverage > 0 ? (writingAverage >= 6.5 ? "Advanced (C1)" : (writingAverage >= 5.0 ? "Intermediate (B2)" : "Beginner/Pre-Int")) : "Chưa xác định"
           }
        }
      });

    } catch (err) {
      console.error("Lỗi getOverview:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new HistoryController();
