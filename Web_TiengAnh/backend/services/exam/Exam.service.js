const mongoose = require("mongoose");
const repo = require("../../repositories/exam/Exam.repository");

class ExamService {
  async createExam(data) {
    return await repo.create(data);
  }

  async getExamById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID không hợp lệ");
    }
    const exam = await repo.findById(id);
    if (!exam) throw new Error("Đề thi không tồn tại");
    return exam;
  }

  async updateExam(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID không hợp lệ");
    }
    const exam = await repo.findById(id);
    if (!exam) throw new Error("Đề thi không tồn tại");
    return await repo.updateById(id, data);
  }

  async deleteExam(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID không hợp lệ");
    }
    const exists = await repo.findById(id);
    if (!exists) throw new Error("Đề thi không tồn tại");
    return await repo.deleteById(id);
  }
  // services/exam/Exam.service.js
  async getAllExams(filter = {}) {
    return await repo.findAll(filter);
  }

  async getPaginatedExams(page = 1, limit = 10, filter = {}) {
    const [data, total] = await Promise.all([
      repo.getPaginated(page, limit, filter),
      repo.countTotal(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

module.exports = new ExamService();
