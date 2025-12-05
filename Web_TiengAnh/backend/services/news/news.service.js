const mongoose = require("mongoose");
const newsRepository = require("../../repositories/news/news.repository");
const path = require("path");
const { deleteFile } = require("../../middlewares/upload.middleware");

class NewsService {
  isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  async createNews(data, imagePath) {
    if (!imagePath) {
      throw new Error("Ảnh là bắt buộc");
    }

    // Validate options
    if (!data.options || data.options.length !== 3) {
      throw new Error("Phải có đúng 3 đáp án");
    }

    // Validate correctAnswer
    if (data.correctAnswer < 0 || data.correctAnswer > 2) {
      throw new Error("Đáp án đúng phải từ 0-2");
    }

    const newsData = {
      ...data,
      image: `/uploads/news/images/${path.basename(imagePath)}`
    };

    return await newsRepository.create(newsData);
  }

  async getAllNews() {
    return await newsRepository.findAll();
  }

  async getNewsPaginated(page, limit) {
    return await newsRepository.findPaginated(page, limit);
  }

  async getNewsById(id) {
    if (!this.isValidObjectId(id)) {
      throw new Error("ID không hợp lệ");
    }

    const news = await newsRepository.findById(id);
    if (!news) {
      throw new Error("Bài báo không tồn tại");
    }
    return news;
  }

  async updateNews(id, data, imagePath) {
    if (!this.isValidObjectId(id)) {
      throw new Error("ID không hợp lệ");
    }

    const existingNews = await newsRepository.findById(id);
    if (!existingNews) {
      throw new Error("Bài báo không tồn tại");
    }

    // Nếu có ảnh mới, xóa ảnh cũ
    if (imagePath) {
      const oldImagePath = path.join(__dirname, "../../public", existingNews.image);
      deleteFile(oldImagePath);
      data.image = `/uploads/news/images/${path.basename(imagePath)}`;
    }

    // Validate options nếu có update
    if (data.options && data.options.length !== 3) {
      throw new Error("Phải có đúng 3 đáp án");
    }

    // Validate correctAnswer nếu có update
    if (data.correctAnswer !== undefined && (data.correctAnswer < 0 || data.correctAnswer > 2)) {
      throw new Error("Đáp án đúng phải từ 0-2");
    }

    const updated = await newsRepository.updateById(id, data);
    return updated;
  }

  async deleteNews(id) {
    if (!this.isValidObjectId(id)) {
      throw new Error("ID không hợp lệ");
    }

    const news = await newsRepository.findById(id);
    if (!news) {
      throw new Error("Bài báo không tồn tại");
    }

    // Xóa ảnh
    const imagePath = path.join(__dirname, "../../public", news.image);
    deleteFile(imagePath);

    await newsRepository.deleteById(id);
    return true;
  }
}

module.exports = new NewsService();