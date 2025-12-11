// // // const repo = require("../../repositories/admin/reading/readingQuestion.repository");

// // // class ReadingQuestionService {
// // //   async getAllReadingQuestions() {
// // //     return await repo.getAll();
// // //   }

// // //   async getReadingQuestionById(id) {
// // //     const question = await repo.getById(id);
// // //     if (!question) throw new Error("Câu hỏi không tồn tại");
// // //     return question;
// // //   }

// // //   async createReadingQuestion(data) {
// // //     return await repo.create(data);
// // //   }

// // //   async updateReadingQuestion(id, data) {
// // //     const exists = await repo.getById(id);
// // //     if (!exists) throw new Error("Câu hỏi không tồn tại");
// // //     return await repo.update(id, data);
// // //   }

// // //   async deleteReadingQuestion(id) {
// // //     const exists = await repo.getById(id);
// // //     if (!exists) throw new Error("Câu hỏi không tồn tại");
// // //     return await repo.remove(id);
// // //   }

// // //   async getQuestionsByPart(partId) {
// // //     return await repo.getByPartId(partId);
// // //   }
// // //   async getPaginatedQuestions(page = 1, limit = 10) {
// // //     const [data, total] = await Promise.all([
// // //       repo.getPaginated(page, limit),
// // //       repo.countTotal(),
// // //     ]);
// // //     return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
// // //   }
// // // }

// // // module.exports = new ReadingQuestionService();

// // // services/reading/readingQuestion.service.js
// // const ReadingQuestion = require("../../models/readingQuestion.model");

// // class ReadingQuestionService {
// //   // CHÍNH LÀ HÀM MÀ CONTROLLER ĐANG GỌI!!!
// //   async createReadingPassage(data) {
// //     return await ReadingQuestion.create(data);
// //   }

// //   async updateReadingPassage(id, data) {
// //     return await ReadingQuestion.findByIdAndUpdate(id, data, { new: true });
// //   }

// //   async getReadingPassageById(id) {
// //     return await ReadingQuestion.findById(id);
// //   }

// //   async getAllReadingPassages() {
// //     return await ReadingQuestion.find().sort({ createdAt: -1 });
// //   }

// //   async deleteReadingPassage(id) {
// //     return await ReadingQuestion.findByIdAndDelete(id);
// //   }

// //   // Dùng cho phân trang
// //   async getPaginatedPassages(page = 1, limit = 10) {
// //     const skip = (page - 1) * limit;
// //     const data = await ReadingQuestion.find()
// //       .sort({ createdAt: -1 })
// //       .skip(skip)
// //       .limit(limit);

// //     const total = await ReadingQuestion.countDocuments();
// //     return {
// //       data,
// //       total,
// //       page: parseInt(page),
// //       limit: parseInt(limit),
// //       totalPages: Math.ceil(total / limit),
// //     };
// //   }
// // }

// // module.exports = new ReadingQuestionService();

// // backend/services/reading/readingQuestion.service.js
// const repo = require("../../repositories/admin/reading/readingQuestion.repository");

// class ReadingQuestionService {
//   async createReadingQuestion(data) {
//     return await repo.create(data);
//   }

//   async getAllReadingQuestions() {
//     return await repo.getAll();
//   }

//   async getReadingQuestionById(id) {
//     const question = await repo.getById(id);
//     if (!question) throw new Error("Câu hỏi không tồn tại");
//     return question;
//   }

//   async updateReadingQuestion(id, data) {
//     const updated = await repo.update(id, data);
//     if (!updated) throw new Error("Câu hỏi không tồn tại");
//     return updated;
//   }

//   async deleteReadingQuestion(id) {
//     const deleted = await repo.remove(id);
//     if (!deleted) throw new Error("Câu hỏi không tồn tại");
//     return deleted;
//   }

//   async getPaginatedQuestions(page = 1, limit = 10) {
//     return await repo.getPaginated(page, limit);
//   }

//   async getQuestionsByPassageNumber(passageNumber) {
//     return await this.validatePassageNumber(passageNumber);
//     return await repo.getByPassageNumber(passageNumber);
//   }

//   validatePassageNumber(passageNumber) {
//     const valid = ["Passage 1", "Passage 2", "Passage 3"];
//     if (!valid.includes(passageNumber)) {
//       throw new Error(
//         "passageNumber phải là Passage 1, Passage 2 hoặc Passage 3"
//       );
//     }
//   }
// }

// module.exports = new ReadingQuestionService();

// backend/services/reading/readingQuestion.service.js
const repo = require("../../repositories/admin/reading/readingQuestion.repository");

class ReadingQuestionService {
  async createReadingQuestion(data) {
    return await repo.create(data);
  }

  async getAllReadingQuestions() {
    return await repo.getAll();
  }

  async getReadingQuestionById(id) {
    const question = await repo.getById(id);
    if (!question) throw new Error("Passage không tồn tại");
    return question;
  }

  async updateReadingQuestion(id, data) {
    const updated = await repo.update(id, data);
    if (!updated) throw new Error("Passage không tồn tại");
    return updated;
  }

  async deleteReadingQuestion(id) {
    const deleted = await repo.delete(id);
    if (!deleted) throw new Error("Passage không tồn tại");
    return deleted;
  }

  async getPaginatedQuestions(page = 1, limit = 10) {
    return await repo.getPaginated(page, limit);
  }

  async getByPassageNumber(passageNumber) {
    const valid = ["Passage 1", "Passage 2", "Passage 3"];
    if (!valid.includes(passageNumber)) {
      throw new Error(
        "passageNumber phải là Passage 1, Passage 2 hoặc Passage 3"
      );
    }
    return await repo.getByPassageNumber(passageNumber);
  }
}

module.exports = new ReadingQuestionService();
