// 👇 Import repo từ repository
const repo = require("../../repositories/admin/listening/listeningQuestion.repository");

class ListeningQuestionService {
  async getAllListeningQuestions() {
    return await repo.getAll();
  }

  async getPaginatedQuestions(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      repo.getPaginated(page, limit),
      repo.countTotal(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getListeningQuestionById(id) {
    const question = await repo.getById(id);
    if (!question) throw new Error("Câu hỏi không tồn tại");
    return question;
  }

  async createListeningQuestion(data) {
    return await repo.create(data);
  }

  async updateListeningQuestion(id, data) {
    const exists = await repo.getById(id);
    if (!exists) throw new Error("Câu hỏi không tồn tại");
    return await repo.update(id, data);
  }

  async deleteListeningQuestion(id) {
    const exists = await repo.getById(id);
    if (!exists) throw new Error("Câu hỏi không tồn tại");
    return await repo.remove(id);
  }

  async getQuestionsByPart(partId) {
    return await repo.getByPartId(partId);
  }
}

module.exports = new ListeningQuestionService();
