

const ListeningQuestionService = require("../../services/listening/listeningQuestion.service");

class ListeningQuestionController {
  // =========================
  // 🔥 CREATE LISTENING QUESTION
  // =========================
  async create(req, res) {
    try {
      if (!req.body.audio) {
        throw new Error("Vui lòng upload file audio!");
      }

      const { title, section, type, transcript, explanation } = req.body;

      // Parse subQuestions từ FE gửi lên
      let subQuestions =
        typeof req.body.subQuestions === "string"
          ? JSON.parse(req.body.subQuestions)
          : req.body.subQuestions;

      // ==========================
      // 🔥 CHUẨN HÓA SUBQUESTION
      // ==========================
      subQuestions = subQuestions.map((sq) => {
        // MULTIPLE CHOICE
        if (type === "multiple_choice") {
          return {
            question: sq.question,
            options: sq.options,
            correctAnswer: sq.correctAnswer,
          };
        }

        // FILL / NOTE / SENTENCE — mảng nhiều đáp án
        if (
          [
            "fill_in_the_blank",
            "note_completion",
            "sentence_completion",
          ].includes(type)
        ) {
          return {
            question: sq.question,
            correctAnswers: sq.correctAnswers || [],
          };
        }

        // MATCHING
        if (type === "matching") {
          return {
            question: sq.question,
            correctAnswer: sq.correctAnswer,
            matchingOptions: sq.matchingOptions || [],
          };
        }

        return sq;
      });

      const questionData = {
        title,
        section,
        type,
        audio: req.body.audio,
        image: req.body.image || null,
        transcript: transcript || "",
        explanation: explanation || "",
        subQuestions,
      };

      const question =
        await ListeningQuestionService.createListeningQuestion(questionData);

      res.status(201).json({
        success: true,
        message: "Tạo câu hỏi Listening thành công!",
        data: question,
      });
    } catch (error) {
      console.error("Lỗi tạo:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // =========================
  // 🔥 UPDATE LISTENING QUESTION
  // =========================
  async update(req, res) {
    try {
      const { title, section, type, transcript, explanation } = req.body;

      // Parse subQuestions
      let subQuestions =
        typeof req.body.subQuestions === "string"
          ? JSON.parse(req.body.subQuestions)
          : req.body.subQuestions;

      // Chuẩn hóa y hệt phần create
      subQuestions = subQuestions.map((sq) => {
        if (type === "multiple_choice") {
          return {
            question: sq.question,
            options: sq.options,
            correctAnswer: sq.correctAnswer,
          };
        }

        if (
          [
            "fill_in_the_blank",
            "note_completion",
            "sentence_completion",
          ].includes(type)
        ) {
          return {
            question: sq.question,
            correctAnswers: sq.correctAnswers || [],
          };
        }

        if (type === "matching") {
          return {
            question: sq.question,
            correctAnswer: sq.correctAnswer,
            matchingOptions: sq.matchingOptions || [],
          };
        }

        return sq;
      });

      const updateData = {
        title,
        section,
        type,
        transcript: transcript || "",
        explanation: explanation || "",
        subQuestions,
      };

      if (req.body.audio) updateData.audio = req.body.audio;
      if (req.body.image !== undefined) updateData.image = req.body.image;

      const question = await ListeningQuestionService.updateListeningQuestion(
        req.params.id,
        updateData
      );

      res.json({
        success: true,
        message: "Cập nhật thành công",
        data: question,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // =========================
  // 🔥 GET BY ID
  // =========================
  // =========================
  // GET BY ID – PHIÊN BẢN HOÀN HẢO, CHẠY NGON 100% CHO TRANG EDIT
  // =========================
  async getById(req, res) {
    try {
      const question = await ListeningQuestionService.getListeningQuestionById(
        req.params.id
      );
      if (!question) throw new Error("Không tìm thấy câu hỏi");

      // =========================
      // CHUẨN HÓA DỮ LIỆU TRƯỚC KHI GỬI CHO FRONTEND
      // =========================
      const normalized = question.toObject();

      // 1. Đảm bảo audio là full URL
      if (normalized.audio) {
        normalized.audio = `${req.protocol}://${req.get("host")}${normalized.audio}`;
      }

      // 2. Chuẩn hóa subQuestions về đúng format frontend đang mong đợi
      if (normalized.subQuestions && normalized.subQuestions.length > 0) {
        normalized.subQuestions = normalized.subQuestions.map((sq) => {
          // Trường hợp multiple_choice: chuyển correctAnswer → correctAnswers[0]
          if (
            normalized.type === "multiple_choice" &&
            sq.correctAnswer !== undefined
          ) {
            return {
              question: sq.question || "",
              options: sq.options || ["", "", "", ""],
              correctAnswers: [sq.correctAnswer], // ← chuyển thành array
            };
          }

          // Trường hợp fill/note/sentence: đảm bảo correctAnswers là array
          if (
            [
              "fill_in_the_blank",
              "note_completion",
              "sentence_completion",
            ].includes(normalized.type)
          ) {
            return {
              question: sq.question || "",
              correctAnswers: Array.isArray(sq.correctAnswers)
                ? sq.correctAnswers
                : sq.correctAnswers
                  ? [sq.correctAnswers]
                  : [],
            };
          }

          // Trường hợp matching
          if (normalized.type === "matching") {
            return {
              question: sq.question || "",
              correctAnswers: sq.correctAnswer ? [sq.correctAnswer] : [],
              matchingOptions: normalized.matchingOptions || [],
            };
          }

          return sq;
        });
      }

      // Nếu là matching thì gán matchingOptions ra ngoài
      if (normalized.type === "matching" && normalized.matchingOptions) {
        normalized.matchingOptions = normalized.matchingOptions;
      }

      res.json({ success: true, data: normalized });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // =========================
  // 🔥 GET PAGINATED
  // =========================
  async getAllPaginated(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await ListeningQuestionService.getPaginatedQuestions(
        page,
        limit
      );

      res.json({
        success: true,
        data: result.data,
        total: result.total,
        totalPages: result.totalPages,
        page,
        limit,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // =========================
  // 🔥 DELETE
  // =========================
  async delete(req, res) {
    try {
      await ListeningQuestionService.deleteListeningQuestion(req.params.id);
      res.json({ success: true, message: "Xóa thành công" });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ListeningQuestionController();
