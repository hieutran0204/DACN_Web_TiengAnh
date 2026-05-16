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

    // Validate questions
    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error("Phải có ít nhất 1 câu hỏi");
    }

    for (const q of data.questions) {
      if (!q.options || q.options.length !== 3) {
        throw new Error("Mỗi câu hỏi phải có đúng 3 đáp án");
      }
      if (q.correctAnswer < 0 || q.correctAnswer > 2) {
        throw new Error("Đáp án đúng phải từ 0-2");
      }
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

    // Validate questions nếu có update
    if (data.questions) {
      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("Phải có ít nhất 1 câu hỏi");
      }
      for (const q of data.questions) {
        if (q.options && q.options.length !== 3) {
          throw new Error("Mỗi câu hỏi phải có đúng 3 đáp án");
        }
        if (q.correctAnswer !== undefined && (q.correctAnswer < 0 || q.correctAnswer > 2)) {
          throw new Error("Đáp án đúng phải từ 0-2");
        }
      }
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