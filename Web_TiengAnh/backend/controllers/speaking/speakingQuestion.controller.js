const SpeakingQuestionService = require("../../services/speaking/speakingQuestion.service");
const mongoose = require("mongoose");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

class SpeakingQuestionController {
  async create(req, res) {
    try {
      const imageFile = req.files?.image?.[0];
      const imageUrl = imageFile
        ? `${BASE_URL}/uploads/speaking/image/${imageFile.filename}`
        : null;

      const {
        skill,
        part,
        topic,
        type,
        question,
        subQuestions,
        suggestedIdeas,
        sampleAnswer,
        difficulty,
      } = req.body;

      if (!skill || !part || !topic || !type || !question) {
        return res.status(400).json({
          success: false,
          message:
            "Thiếu thông tin bắt buộc: skill, part, topic, type, question",
        });
      }

      const questionData = {
        skill,
        part,
        topic,
        type,
        question,
        subQuestions: Array.isArray(subQuestions)
          ? subQuestions
          : subQuestions
            ? [subQuestions]
            : [],
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
        await SpeakingQuestionService.createSpeakingQuestion(questionData);

      res.status(201).json({ success: true, data: createdQuestion });
    } catch (error) {
      console.error("Lỗi tạo câu hỏi:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const imageFile = req.files?.image?.[0];
      const {
        skill,
        part,
        topic,
        type,
        question,
        subQuestions,
        suggestedIdeas,
        sampleAnswer,
        difficulty,
      } = req.body;

      if (!skill || !part || !topic || !type || !question) {
        return res.status(400).json({
          success: false,
          message:
            "Thiếu thông tin bắt buộc: skill, part, topic, type, question",
        });
      }

      const questionData = {
        skill,
        part,
        topic,
        type,
        question,
        subQuestions: Array.isArray(subQuestions)
          ? subQuestions
          : subQuestions
            ? [subQuestions]
            : [],
        suggestedIdeas: Array.isArray(suggestedIdeas)
          ? suggestedIdeas
          : suggestedIdeas
            ? [suggestedIdeas]
            : [],
        sampleAnswer: sampleAnswer || "",
        difficulty: difficulty || "medium",
      };

      if (imageFile) {
        questionData.image = `${BASE_URL}/uploads/speaking/image/${imageFile.filename}`;
      } else if (req.body.image) {
        questionData.image = req.body.image.startsWith("/")
          ? `${BASE_URL}${req.body.image}`
          : req.body.image;
      }

      const updatedQuestion =
        await SpeakingQuestionService.updateSpeakingQuestion(
          req.params.id,
          questionData
        );

      res.status(200).json({ success: true, data: updatedQuestion });
    } catch (error) {
      console.error("Lỗi cập nhật câu hỏi:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const foundQuestion =
        await SpeakingQuestionService.getSpeakingQuestionById(req.params.id);
      if (!foundQuestion) throw new Error("Câu hỏi không tồn tại");

      res.status(200).json({ success: true, data: foundQuestion });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const questions = await SpeakingQuestionService.getAllSpeakingQuestions();
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await SpeakingQuestionService.deleteSpeakingQuestion(req.params.id);
      res.status(200).json({ success: true, message: "Câu hỏi đã xóa" });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getByPart(req, res) {
    try {
      const partId = req.params.partId;
      const questions =
        await SpeakingQuestionService.getQuestionsByPart(partId);
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getAllPaginated(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await SpeakingQuestionService.getPaginatedQuestions(
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

module.exports = new SpeakingQuestionController();
