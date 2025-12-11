// // const mongoose = require("mongoose");
// // const ReadingQuestion = require("../../../models/readingQuestion.model");

// // exports.getAll = async () => await ReadingQuestion.find().populate("part");

// // exports.getById = async (id) =>
// //   await ReadingQuestion.findById(id).populate("part");

// // exports.create = async (data) => await ReadingQuestion.create(data);

// // exports.update = async (id, data) =>
// //   await ReadingQuestion.findByIdAndUpdate(id, data, { new: true });

// // exports.remove = async (id) => await ReadingQuestion.findByIdAndDelete(id);

// // // Lấy theo trang
// // exports.getPaginated = async (page = 1, limit = 10) => {
// //   const skip = (page - 1) * limit;
// //   return await ReadingQuestion.find()
// //     .populate("part", "name")
// //     .skip(skip)
// //     .limit(limit);
// // };

// // exports.countTotal = async () => await ReadingQuestion.countDocuments();

// // // Đếm tổng số bản ghi
// // exports.countTotal = async () => await ReadingQuestion.countDocuments();

// // exports.getByPartId = async (partId) =>
// //   await ReadingQuestion.find({ part: partId }).populate("part");

// // backend/repositories/admin/reading/readingQuestion.repository.js
// const ReadingQuestion = require("../../../models/readingQuestion.model");

// exports.getAll = async () => {
//   return await ReadingQuestion.find().sort({ createdAt: -1 });
// };

// exports.getById = async (id) => {
//   return await ReadingQuestion.findById(id);
// };

// exports.create = async (data) => {
//   return await ReadingQuestion.create(data);
// };

// exports.update = async (id, data) => {
//   return await ReadingQuestion.findByIdAndUpdate(id, data, {
//     new: true,
//     runValidators: true,
//   });
// };

// exports.remove = async (id) => {
//   return await ReadingQuestion.findByIdAndDelete(id);
// };

// exports.getPaginated = async (page = 1, limit = 10) => {
//   const skip = (page - 1) * limit;
//   const data = await ReadingQuestion.find()
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit);

//   const total = await ReadingQuestion.countDocuments();
//   return { data, total };
// };

// exports.getByPassageNumber = async (passageNumber) => {
//   return await ReadingQuestion.find({ passageNumber }).sort({ createdAt: -1 });
// };

// backend/repositories/admin/reading/readingQuestion.repository.js
const ReadingQuestion = require("../../../models/readingQuestion.model");

class ReadingQuestionRepository {
  async create(data) {
    return await ReadingQuestion.create(data);
  }

  async getAll() {
    return await ReadingQuestion.find().sort({ createdAt: -1 });
  }

  async getById(id) {
    return await ReadingQuestion.findById(id);
  }

  async update(id, data) {
    return await ReadingQuestion.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await ReadingQuestion.findByIdAndDelete(id);
  }

  async getPaginated(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      ReadingQuestion.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      ReadingQuestion.countDocuments(),
    ]);
    return { data, total };
  }

  async getByPassageNumber(passageNumber) {
    return await ReadingQuestion.find({ passageNumber }).sort({
      createdAt: -1,
    });
  }
}

module.exports = new ReadingQuestionRepository();
