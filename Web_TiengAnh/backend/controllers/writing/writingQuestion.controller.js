const WritingQuestionService = require("../../services/writing/writingQuestion.service");
const mongoose = require("mongoose");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

class WritingQuestionController {
  async create(req, res) {
    try {
      const imageFile = req.files?.image?.[0];
      const imageUrl = imageFile
        ? `${BASE_URL}/uploads/writing/image/${imageFile.filename}`
        : null;

      const {
        skill,
        part,
        task,
        type,
        topic,
        question,
        suggestedIdeas,
        sampleAnswer,
        difficulty,
      } = req.body;

      if (!skill || !part || !task || !type || !topic || !question) {
        return res.status(400).json({
          success: false,
          message:
            "Thiếu thông tin bắt buộc: skill, part, task, type, topic, question",
        });
      }

      const questionData = {
        skill,
        part,
        task,
        type,
        topic,
        question,
        suggestedIdeas: Array.isArray(suggestedIdeas)
          ? suggestedIdeas
          : suggestedIdeas
            ? [suggestedIdeas]
            : [],
        sampleAnswer: sampleAnswer || "",
        difficulty: difficulty || "medium",
        image: imageUrl,
      };

      const createdQuestion =
        await WritingQuestionService.createWritingQuestion(questionData);

      res.status(201).json({ success: true, data: createdQuestion });
    } catch (error) {
      console.error("Lỗi tạo câu hỏi Writing:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const imageFile = req.files?.image?.[0];
      const {
        skill,
        part,
        task,
        type,
        topic,
        question,
        suggestedIdeas,
        sampleAnswer,
        difficulty,
      } = req.body;

      if (!skill || !part || !task || !type || !topic || !question) {
        return res.status(400).json({
          success: false,
          message:
            "Thiếu thông tin bắt buộc: skill, part, task, type, topic, question",
        });
      }

      const questionData = {
        skill,
        part,
        task,
        type,
        topic,
        question,
        suggestedIdeas: Array.isArray(suggestedIdeas)
          ? suggestedIdeas
          : suggestedIdeas
            ? [suggestedIdeas]
            : [],
        sampleAnswer: sampleAnswer || "",
        difficulty: difficulty || "medium",
      };

      if (imageFile) {
        questionData.image = `${BASE_URL}/uploads/writing/image/${imageFile.filename}`;
      } else if (req.body.image) {
        questionData.image = req.body.image.startsWith("/")
          ? `${BASE_URL}${req.body.image}`
          : req.body.image;
      }

      const updatedQuestion =
        await WritingQuestionService.updateWritingQuestion(
          req.params.id,
          questionData
        );

      res.status(200).json({ success: true, data: updatedQuestion });
    } catch (error) {
      console.error("Lỗi cập nhật câu hỏi Writing:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const foundQuestion = await WritingQuestionService.getWritingQuestionById(
        req.params.id
      );
      if (!foundQuestion) throw new Error("Câu hỏi không tồn tại");

      res.status(200).json({ success: true, data: foundQuestion });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const questions = await WritingQuestionService.getAllWritingQuestions();
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await WritingQuestionService.deleteWritingQuestion(req.params.id);
      res.status(200).json({ success: true, message: "Câu hỏi đã xóa" });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getByPart(req, res) {
    try {
      const partId = req.params.partId;
      const questions = await WritingQuestionService.getQuestionsByPart(partId);
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getAllPaginated(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await WritingQuestionService.getPaginatedQuestions(
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: page < result.totalPages,
        hasPrevPage: page > 1,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new WritingQuestionController();
