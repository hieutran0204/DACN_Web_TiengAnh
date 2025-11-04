const mongoose = require("mongoose");
const SpeakingQuestion = require("../../../models/speakingQuestion.model");

exports.getAll = async () => await SpeakingQuestion.find();

exports.getById = async (id) =>
  await SpeakingQuestion.findById(id).populate("part", "name");

exports.create = async (data) => await SpeakingQuestion.create(data);

exports.update = async (id, data) =>
  await SpeakingQuestion.findByIdAndUpdate(id, data, { new: true });

exports.remove = async (id) => await SpeakingQuestion.findByIdAndDelete(id);

// ✅ Lấy theo trang (ĐÃ SỬA)
exports.getPaginated = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await SpeakingQuestion.find()
    .populate("part", "name") // ✅ Để FE hiển thị part.name
    .populate("skill", "name") // ✅ Nếu muốn hiển thị skill
    .skip(skip)
    .limit(limit)
    .lean(); // Cho FE dễ xử lý object
};

exports.countTotal = async () => await SpeakingQuestion.countDocuments();

exports.getByPartId = async (partId) =>
  await SpeakingQuestion.find({ part: partId }).populate("part", "name");
