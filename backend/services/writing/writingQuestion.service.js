// const repo = require("../../repositories/admin/writing/writingQuestion.repositor");

// class WritingQuestionService {
//   async getAllWritingQuestions() {
//     return await repo.getAll();
//   }

//   async getWritingQuestionById(id) {
//     const question = await repo.getById(id);
//     if (!question) throw new Error("Câu hỏi không tồn tại");
//     return question;
//   }

//   async createWritingQuestion(data) {
//     return await repo.create(data);
//   }

//   async updateWritingQuestion(id, data) {
//     const exists = await repo.getById(id);
//     if (!exists) throw new Error("Câu hỏi không tồn tại");
//     return await repo.update(id, data);
//   }

//   async deleteWritingQuestion(id) {
//     const exists = await repo.getById(id);
//     if (!exists) throw new Error("Câu hỏi không tồn tại");
//     return await repo.remove(id);
//   }

//   async getQuestionsByPart(partId) {
//     return await repo.getByPartId(partId);
//   }

//   async getPaginatedQuestions(page = 1, limit = 10) {
//     const data = await repo.getPaginated(page, limit);
//     const total = await repo.countTotal();
//     return {
//       data,
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     };
//   }
// }

// module.exports = new WritingQuestionService();

const repo = require("../../repositories/admin/writing/writingQuestion.repositor");

class WritingQuestionService {
  // LẤY TẤT CẢ – CHUẨN NHƯ SPEAKING
  async getAllWritingQuestions() {
    return await repo.getAll();
  }

  // LẤY THEO ID – CÓ KIỂM TRA TỒN TẠI NHƯ SPEAKING
  async getWritingQuestionById(id) {
    const question = await repo.getById(id);
    if (!question) throw new Error("Câu hỏi không tồn tại");
    return question;
  }

  // TẠO MỚI
  async createWritingQuestion(data) {
    return await repo.create(data);
  }

  // CẬP NHẬT – KIỂM TRA TỒN TẠI TRƯỚC KHI UPDATE
  async updateWritingQuestion(id, data) {
    const exists = await repo.getById(id);
    if (!exists) throw new Error("Câu hỏi không tồn tại");
    return await repo.update(id, data);
  }

  // XÓA – CŨNG KIỂM TRA TRƯỚC KHI XÓA
  async deleteWritingQuestion(id) {
    const exists = await repo.getById(id);
    if (!exists) throw new Error("Câu hỏi không tồn tại");
    return await repo.remove(id);
  }

  // LẤY THEO PART (DỰ PHÒNG)
  async getQuestionsByPart(partId) {
    return await repo.getByPartId(partId);
  }

  // PHÂN TRANG – ĐẸP NHƯ SPEAKING
  async getPaginatedQuestions(page = 1, limit = 10, search = "") {
    const data = await repo.getPaginated(page, limit, search);
    const total = await repo.countTotal(search);
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

module.exports = new WritingQuestionService();
