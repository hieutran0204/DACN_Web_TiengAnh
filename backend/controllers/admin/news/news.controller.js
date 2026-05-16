const newsService = require("../../../services/news/news.service");

class NewsAdminController {
  async create(req, res) {
    try {
      const imagePath = req.file ? req.file.path : null;
      
      // Parse questions từ string sang array
      let questions = req.body.questions;
      if (typeof questions === 'string') {
        questions = JSON.parse(questions);
      }

      const data = {
        ...req.body,
        questions
      };

      const news = await newsService.createNews(data, imagePath);
      res.status(201).json({
        success: true,
        message: "Tạo bài báo thành công",
        data: news
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAll(req, res) {
    try {
      const news = await newsService.getAllNews();
      res.status(200).json({
        success: true,
        data: news
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const news = await newsService.getNewsById(req.params.id);
      res.status(200).json({
        success: true,
        data: news
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const imagePath = req.file ? req.file.path : null;
      
      // Parse questions từ string sang array
      let questions = req.body.questions;
      if (questions && typeof questions === 'string') {
        questions = JSON.parse(questions);
      }

      const data = {
        ...req.body,
        ...(questions && { questions })
      };

      const updated = await newsService.updateNews(req.params.id, data, imagePath);
      res.status(200).json({
        success: true,
        message: "Cập nhật thành công",
        data: updated
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      await newsService.deleteNews(req.params.id);
      res.status(200).json({
        success: true,
        message: "Xóa bài báo thành công"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new NewsAdminController();