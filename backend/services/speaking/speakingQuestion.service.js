const repo = require("../../repositories/admin/speaking/speakingQuestion.repository");

class SpeakingQuestionService {
  async getAllSpeakingQuestions() {
    return await repo.getAll();
  }

  async getSpeakingQuestionById(id) {
    const question = await repo.getById(id);
    if (!question) throw new Error("Câu hỏi không tồn tại");
    return question;
  }

  async createSpeakingQuestion(data) {
    return await repo.create(data);
  }

  async updateSpeakingQuestion(id, data) {
    const exists = await repo.getById(id);
    if (!exists) throw new Error("Câu hỏi không tồn tại");
    return await repo.update(id, data);
  }

  async deleteSpeakingQuestion(id) {
    const exists = await repo.getById(id);
    if (!exists) throw new Error("Câu hỏi không tồn tại");
    return await repo.remove(id);
  }

  async getQuestionsByPart(partId) {
    return await repo.getByPartId(partId);
  }

  async getPaginatedQuestions(page = 1, limit = 10, search = "") {
    const result = await repo.getPaginated(page, limit, search);
    return {
      data: result.data,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}

module.exports = new SpeakingQuestionService();
