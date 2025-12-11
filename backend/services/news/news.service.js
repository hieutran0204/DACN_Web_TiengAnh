const mongoose = require("mongoose");
const newsRepository = require("../../repositories/news/news.repository");

class NewsService {
  isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  async createNews(data) {
    return await newsRepository.create(data);
  }

  async getAllNews() {
    return await newsRepository.findAll();
  }

  async getNewsById(id) {
    if (!this.isValidObjectId(id)) throw new Error("Invalid ID");
    const news = await newsRepository.findById(id);
    if (!news) throw new Error("News not found");
    return news;
  }

  async updateNews(id, data) {
    if (!this.isValidObjectId(id)) throw new Error("Invalid ID");
    const news = await newsRepository.updateById(id, data);
    if (!news) throw new Error("News not found");
    return news;
  }

  async deleteNews(id) {
    if (!this.isValidObjectId(id)) throw new Error("Invalid ID");
    const news = await newsRepository.deleteById(id);
    if (!news) throw new Error("News not found");
    return true;
  }
}

module.exports = new NewsService();
