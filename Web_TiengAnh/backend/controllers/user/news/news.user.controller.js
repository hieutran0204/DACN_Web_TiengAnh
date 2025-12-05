const newsService = require("../../../services/news/news.service");

class NewsUserController {
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await newsService.getNewsPaginated(page, limit);
      
      res.status(200).json({
        success: true,
        data: result.news,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total
        }
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

  async checkAnswer(req, res) {
    try {
      const { id } = req.params;
      const { answer } = req.body;

      const news = await newsService.getNewsById(id);
      const isCorrect = parseInt(answer) === news.correctAnswer;

      res.status(200).json({
        success: true,
        correct: isCorrect,
        correctAnswer: news.correctAnswer
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new NewsUserController();