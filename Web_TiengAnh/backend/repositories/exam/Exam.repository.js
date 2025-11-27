// // repositories/exam/Exam.repository.js
// const Exam = require("../../models/exam.model");

// const ExamRepository = {
//   async create(data) {
//     return await Exam.create(data);
//   },

//   async findAll(filter = {}) {
//     return await Exam.find(filter)
//       .sort({ createdAt: -1 })
//       .populate(
//         "skills.listening skills.reading skills.writing skills.speaking"
//       );
//   },

//   async findById(id) {
//     return await Exam.findById(id).populate(
//       "skills.listening skills.reading skills.writing skills.speaking"
//     );
//   },

//   async updateById(id, data) {
//     return await Exam.findByIdAndUpdate(id, data, {
//       new: true,
//       runValidators: true,
//     }).populate(
//       "skills.listening skills.reading skills.writing skills.speaking"
//     );
//   },

//   async deleteById(id) {
//     return await Exam.findByIdAndDelete(id);
//   },

//   async getPaginated(page = 1, limit = 10, filter = {}) {
//     return await Exam.find(filter)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .populate(
//         "skills.listening skills.reading skills.writing skills.speaking"
//       );
//   },

//   async countTotal(filter = {}) {
//     return await Exam.countDocuments(filter);
//   },
// };

// module.exports = ExamRepository;
// repositories/exam/Exam.repository.js
const Exam = require("../../models/exam.model");

const populateSkills = [
  "skills.listening",
  "skills.reading",
  "skills.writing",
  "skills.speaking",
];

const ExamRepository = {
  async create(data) {
    return await Exam.create(data);
  },

  async findAll(filter = {}) {
    return await Exam.find(filter)
      .sort({ createdAt: -1 })
      .populate(populateSkills);
  },

  async findById(id) {
    return await Exam.findById(id).populate(populateSkills);
  },

  async updateById(id, data) {
    return await Exam.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate(populateSkills);
  },

  async deleteById(id) {
    return await Exam.findByIdAndDelete(id);
  },

  // FIX: getPaginated phải trả về array, không phải cursor
  async getPaginated(page = 1, limit = 10, filter = {}) {
    const data = await Exam.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(populateSkills)
      .lean(); // Thêm .lean() để trả object JS thuần, nhanh hơn

    return data;
  },

  async countTotal(filter = {}) {
    return await Exam.countDocuments(filter);
  },

  // Bonus: thêm hàm tiện ích nếu cần
  async findOneAndUpdate(filter, update) {
    return await Exam.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
    }).populate(populateSkills);
  },
};

module.exports = ExamRepository;
