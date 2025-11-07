const News = require("../../models/news/news.model");

class NewsRepository {
  async create(data) {
    return await News.create(data);
  }

  async findAll() {
    return await News.find().sort({ createdAt: -1 });
  }

  async findById(id) {
    return await News.findById(id);
  }

  async updateById(id, data) {
    return await News.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id) {
    return await News.findByIdAndDelete(id);
  }
}

module.exports = new NewsRepository();
