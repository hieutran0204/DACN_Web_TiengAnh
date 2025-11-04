const mongoose = require("mongoose");
const WritingQuestion = require("../../../models/writingQuestion.model");

exports.getAll = async () => await WritingQuestion.find();

exports.getById = async (id) =>
  await WritingQuestion.findById(id).populate("part", "name");

exports.create = async (data) => await WritingQuestion.create(data);

exports.update = async (id, data) =>
  await WritingQuestion.findByIdAndUpdate(id, data, { new: true });

exports.remove = async (id) => await WritingQuestion.findByIdAndDelete(id);

// ✅ Lấy theo trang (ĐÃ SỬA)
exports.getPaginated = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await WritingQuestion.find()
    .populate("part", "name") // ✅ Để FE hiển thị part.name
    .populate("skill", "name") // ✅ Nếu muốn hiển thị skill
    .skip(skip)
    .limit(limit)
    .lean(); // Cho FE dễ xử lý object
};

exports.countTotal = async () => await WritingQuestion.countDocuments();

exports.getByPartId = async (partId) =>
  await WritingQuestion.find({ part: partId }).populate("part", "name");
