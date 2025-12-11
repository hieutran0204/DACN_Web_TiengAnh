// const mongoose = require("mongoose");
// const repo = require("../../repositories/exam/Exam.repository");

// class ExamService {
//   async createExam(data) {
//     return await repo.create(data);
//   }

//   async getExamById(id) {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       throw new Error("ID không hợp lệ");
//     }
//     const exam = await repo.findById(id);
//     if (!exam) throw new Error("Đề thi không tồn tại");
//     return exam;
//   }

//   async updateExam(id, data) {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       throw new Error("ID không hợp lệ");
//     }
//     const exam = await repo.findById(id);
//     if (!exam) throw new Error("Đề thi không tồn tại");
//     return await repo.updateById(id, data);
//   }

//   async deleteExam(id) {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       throw new Error("ID không hợp lệ");
//     }
//     const exists = await repo.findById(id);
//     if (!exists) throw new Error("Đề thi không tồn tại");
//     return await repo.deleteById(id);
//   }
//   // services/exam/Exam.service.js
//   async getAllExams(filter = {}) {
//     return await repo.findAll(filter);
//   }

//   async getPaginatedExams(page = 1, limit = 10, filter = {}) {
//     const [data, total] = await Promise.all([
//       repo.getPaginated(page, limit, filter),
//       repo.countTotal(filter),
//     ]);

//     return {
//       data,
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     };
//   }
// }

// module.exports = new ExamService();
// services/exam/Exam.service.js
const mongoose = require("mongoose");
const repo = require("../../repositories/exam/Exam.repository");

class ExamService {
  async createExam(data) {
    const { title, skills = {} } = data;

    if (!title?.trim()) {
      throw new Error("Tiêu đề đề thi là bắt buộc");
    }

    const totalQuestions = Object.values(skills).flat().length;
    if (totalQuestions === 0) {
      throw new Error("Đề thi phải có ít nhất 1 câu hỏi");
    }

    return await repo.create({
      ...data,
      title: title.trim(),
      isPublished: false, // luôn tạo draft trước
    });
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
    await this.getExamById(id); // kiểm tra tồn tại + validate ID
    return await repo.updateById(id, data);
  }

  async deleteExam(id) {
    await this.getExamById(id); // kiểm tra tồn tại
    return await repo.deleteById(id);
  }

  async publishExam(id) {
    const exam = await this.getExamById(id);

    if (exam.isPublished) {
      throw new Error("Đề thi đã được công khai rồi");
    }

    const totalQuestions = Object.values(exam.skills || {}).flat().length;
    if (totalQuestions === 0) {
      throw new Error("Không thể công khai đề thi trống");
    }

    return await repo.updateById(id, { isPublished: true });
  }

  async getAllExams(filter = {}) {
    return await repo.findAll(filter);
  }

  async getPaginatedExams(page = 1, limit = 10, filter = {}) {
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100; // giới hạn tránh DDoS

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
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }
}

module.exports = new ExamService();
