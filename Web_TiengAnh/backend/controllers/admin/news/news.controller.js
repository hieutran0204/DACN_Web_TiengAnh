const newsService = require("../../../services/news/news.service");

class NewsAdminController {
  async create(req, res) {
    try {
      const news = await newsService.createNews(req.body);
      res.status(201).json({ message: "Tạo bài viết thành công", data: news });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

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

  async update(req, res) {
    try {
      const updated = await newsService.updateNews(req.params.id, req.body);
      res.status(200).json({ message: "Cập nhật thành công", data: updated });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await newsService.deleteNews(req.params.id);
      res.status(200).json({ message: "Xóa bài viết thành công" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new NewsAdminController();
