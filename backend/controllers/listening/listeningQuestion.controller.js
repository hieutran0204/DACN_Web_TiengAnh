

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
          // Fix: Allow correctAnswers array for MC questions too
          let finalCorrectAnswer = sq.correctAnswer;
          if (Array.isArray(sq.correctAnswers) && sq.correctAnswers.length > 0) {
             finalCorrectAnswer = sq.correctAnswers[0];
          }

          return {
            question: sq.question,
            options: sq.options,
            correctAnswer: finalCorrectAnswer,
            correctAnswers: sq.correctAnswers
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

      // Parse segments (cho Dictation)
      let segments = [];
      if (req.body.segments) {
        segments = typeof req.body.segments === "string" 
          ? JSON.parse(req.body.segments) 
          : req.body.segments;
      }

      const questionData = {
        title,
        section,
        type,
        audio: req.body.audio,
        image: req.body.image || null,
        transcript: transcript || "",
        explanation: explanation || "",
        subQuestions,
        segments, // New field
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

      // Parse segments
      let segments = [];
      if (req.body.segments) {
        segments = typeof req.body.segments === "string" 
          ? JSON.parse(req.body.segments) 
          : req.body.segments;
      }

      // Chuẩn hóa y hệt phần create
      subQuestions = subQuestions.map((sq) => {
        // MULTIPLE CHOICE
        if (type === "multiple_choice") {
          // Fix: Allow correctAnswers array for MC questions too
          // Fallback to correctAnswer if array is missing
          let finalCorrectAnswer = sq.correctAnswer;
          if (Array.isArray(sq.correctAnswers) && sq.correctAnswers.length > 0) {
             finalCorrectAnswer = sq.correctAnswers[0];
          }

          return {
            question: sq.question,
            options: sq.options,
            correctAnswer: finalCorrectAnswer,
            correctAnswers: sq.correctAnswers // Pass this through so Mongoose pre-validate can see it if needed
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
        segments, // New field
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

      const search = req.query.search || "";
      const result = await ListeningQuestionService.getPaginatedQuestions(
        page,
        limit,
        search
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

  // =========================
  // 🔥 AUTO GENERATE TRANSCRIPT (GEMINI AI)
  // =========================
  async generateTranscript(req, res) {
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const fs = require("fs");
      const path = require("path");

      const audioUrl = req.body.audioUrl; 
      if (!audioUrl) throw new Error("Missing audioUrl");

      // Verify API Key
      if (!process.env.GEMINI_API_KEY) {
         throw new Error("Missing GEMINI_API_KEY in server environment");
      }

      // 1. Resolve file path
      // Remove leading slash if present to join correctly
      const relativePath = audioUrl.startsWith("/") ? audioUrl.slice(1) : audioUrl;
      const filePath = path.join(__dirname, "../../public", relativePath);

      if (!fs.existsSync(filePath)) {
        throw new Error("Audio file not found on server at: " + filePath);
      }

      // 2. Prepare Gemini
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // 3. Convert file to GenerativePart
      const fileBuffer = fs.readFileSync(filePath);
      const audioPart = {
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType: "audio/mp3", // Adjust if needed
        },
      };

      const prompt = `
        Listen to this audio and generate a precise timestamped transcript.
        Return ONLY a raw JSON array (no markdown block) with this format:
        [
          { "start": 0.0, "end": 2.5, "text": "Hello world" },
          ...
        ]
        "start" and "end" are in seconds. Text should be accurate.
      `;

      const result = await model.generateContent([prompt, audioPart]);
      const response = await result.response;
      let text = response.text();

      // Clean up markdown code blocks if Gemini sends them
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      const segments = JSON.parse(text);

      res.json({ success: true, data: segments });

    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ListeningQuestionController();
