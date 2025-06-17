const repo = require("../../repositories/admin/reading/readingQuestion.repository");

class ReadingQuestionService {
  async getAllReadingQuestions() {
    return await repo.getAll();
  }

  async getReadingQuestionById(id) {
    const question = await repo.getById(id);
    if (!question) throw new Error("Câu hỏi không tồn tại");
    return question;
  }

  async createReadingQuestion(data) {
    return await repo.create(data);
  }

  async updateReadingQuestion(id, data) {
    const exists = await repo.getById(id);
    if (!exists) throw new Error("Câu hỏi không tồn tại");
    return await repo.update(id, data);
  }

  async deleteReadingQuestion(id) {
    const exists = await repo.getById(id);
    if (!exists) throw new Error("Câu hỏi không tồn tại");
    return await repo.remove(id);
  }

  async getQuestionsByPart(partId) {
    return await repo.getByPartId(partId);
  }
}

module.exports = new ReadingQuestionService();
