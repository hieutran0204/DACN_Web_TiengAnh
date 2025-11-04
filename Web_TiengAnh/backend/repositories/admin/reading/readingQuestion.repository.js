const mongoose = require("mongoose");
const ReadingQuestion = require("../../../models/readingQuestion.model");

exports.getAll = async () => await ReadingQuestion.find().populate("part");

exports.getById = async (id) =>
  await ReadingQuestion.findById(id).populate("part");

exports.create = async (data) => await ReadingQuestion.create(data);

exports.update = async (id, data) =>
  await ReadingQuestion.findByIdAndUpdate(id, data, { new: true });

exports.remove = async (id) => await ReadingQuestion.findByIdAndDelete(id);

// Lấy theo trang
exports.getPaginated = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await ReadingQuestion.find()
    .populate("part", "name")
    .skip(skip)
    .limit(limit);
};

exports.countTotal = async () => await ReadingQuestion.countDocuments();

// Đếm tổng số bản ghi
exports.countTotal = async () => await ReadingQuestion.countDocuments();

exports.getByPartId = async (partId) =>
  await ReadingQuestion.find({ part: partId }).populate("part");
