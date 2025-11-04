const repo = require("../../repositories/admin/writing/writingQuestion.repositor");

class WritingQuestionService {
  async getAllWritingQuestions() {
    return await repo.getAll();
  }

  async getWritingQuestionById(id) {
    const question = await repo.getById(id);
    if (!question) throw new Error("Câu hỏi không tồn tại");
    return question;
  }

  async createWritingQuestion(data) {
    return await repo.create(data);
  }

  async updateWritingQuestion(id, data) {
    const exists = await repo.getById(id);
    if (!exists) throw new Error("Câu hỏi không tồn tại");
    return await repo.update(id, data);
  }

  async deleteWritingQuestion(id) {
    const exists = await repo.getById(id);
    if (!exists) throw new Error("Câu hỏi không tồn tại");
    return await repo.remove(id);
  }

  async getQuestionsByPart(partId) {
    return await repo.getByPartId(partId);
  }

  async getPaginatedQuestions(page = 1, limit = 10) {
    const data = await repo.getPaginated(page, limit);
    const total = await repo.countTotal();
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
