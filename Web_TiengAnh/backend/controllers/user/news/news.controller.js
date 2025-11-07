const newsService = require("../../../services/news/news.service");

class NewsUserController {
  async getAll(req, res) {
    try {
      const newsList = await newsService.getAllNews();
      res.status(200).json({ data: newsList });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const news = await newsService.getNewsById(req.params.id);
      res.status(200).json({ data: news });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new NewsUserController();
