const ReadingQuestion = require("../../../models/readingQuestion.model");

exports.getAll = async () => await ReadingQuestion.find().populate("part");

exports.getById = async (id) =>
  await ReadingQuestion.findById(id).populate("part");

exports.create = async (data) => await ReadingQuestion.create(data);

exports.update = async (id, data) =>
  await ReadingQuestion.findByIdAndUpdate(id, data, { new: true });

exports.remove = async (id) => await ReadingQuestion.findByIdAndDelete(id);

exports.getByPartId = async (partId) =>
  await ReadingQuestion.find({ part: partId }).populate("part");
