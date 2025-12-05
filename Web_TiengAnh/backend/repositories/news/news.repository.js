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
    return await News.findByIdAndUpdate(id, data, { 
      new: true,
      runValidators: true 
    });
  }

  async deleteById(id) {
    return await News.findByIdAndDelete(id);
  }

  // Phân trang
  async findPaginated(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const news = await News.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await News.countDocuments();
    
    return {
      news,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}

module.exports = new NewsRepository();