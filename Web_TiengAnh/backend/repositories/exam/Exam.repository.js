const Exam = require("../../models/exam.model");

const ExamRepository = {
  async create(data) {
    return await Exam.create(data);
  },

  async findAll() {
    return await Exam.find().populate(
      "skills.listening skills.reading skills.writing skills.speaking"
    );
  },

  async findById(id) {
    return await Exam.findById(id).populate(
      "skills.listening skills.reading skills.writing skills.speaking"
    );
  },

  async updateById(id, data) {
    return await Exam.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      populate:
        "skills.listening skills.reading skills.writing skills.speaking",
    });
  },

  async deleteById(id) {
    return await Exam.findByIdAndDelete(id);
  },

  async getPaginated(page = 1, limit = 10) {
    return await Exam.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(
        "skills.listening skills.reading skills.writing skills.speaking"
      );
  },

  async countTotal() {
    return await Exam.countDocuments();
  },
};

module.exports = ExamRepository;
