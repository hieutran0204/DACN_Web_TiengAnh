const mongoose = require("mongoose");
const Listening = require("../../../models/listeningQuestion.model");

// Lấy tất cả câu hỏi
exports.getAll = async () => await Listening.find().populate("part");

// Lấy theo ID
exports.getById = async (id) => await Listening.findById(id).populate("part");

// Tạo mới
exports.create = async (data) => await Listening.create(data);

// Cập nhật
exports.update = async (id, data) =>
  await Listening.findByIdAndUpdate(id, data, { new: true });

// Xóa
exports.remove = async (id) => await Listening.findByIdAndDelete(id);

// Lấy theo trang
exports.getPaginated = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await Listening.find()
    .populate("part", "name")
    .skip(skip)
    .limit(limit);
};

exports.countTotal = async () => await Listening.countDocuments();

// Đếm tổng số bản ghi
exports.countTotal = async () => await Listening.countDocuments();

// Tìm theo partId
exports.getByPartId = async (partId) =>
  await Listening.find({ part: partId }).populate("part", "name");
