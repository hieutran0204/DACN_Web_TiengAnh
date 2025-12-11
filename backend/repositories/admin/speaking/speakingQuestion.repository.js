// repositories/admin/speaking/speakingQuestion.repository.js

const SpeakingQuestion = require("../../../models/speakingQuestion.model");

exports.getAll = async () =>
  await SpeakingQuestion.find().sort({ createdAt: -1 });

exports.getById = async (id) => await SpeakingQuestion.findById(id);

exports.create = async (data) => await SpeakingQuestion.create(data);

exports.update = async (id, data) =>
  await SpeakingQuestion.findByIdAndUpdate(id, data, { new: true });

exports.remove = async (id) => await SpeakingQuestion.findByIdAndDelete(id);

exports.getPaginated = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await SpeakingQuestion.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

exports.countTotal = async () => await SpeakingQuestion.countDocuments();

exports.getByPartId = async (partName) =>
  await SpeakingQuestion.find({ part: partName }).sort({ createdAt: -1 });
