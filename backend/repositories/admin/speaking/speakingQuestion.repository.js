// repositories/admin/speaking/speakingQuestion.repository.js

const SpeakingQuestion = require("../../../models/speakingQuestion.model");

exports.getAll = async () =>
  await SpeakingQuestion.find().sort({ createdAt: -1 });

exports.getById = async (id) => await SpeakingQuestion.findById(id);

exports.create = async (data) => await SpeakingQuestion.create(data);

exports.update = async (id, data) =>
  await SpeakingQuestion.findByIdAndUpdate(id, data, { new: true });

exports.remove = async (id) => await SpeakingQuestion.findByIdAndDelete(id);

exports.getPaginated = async (page = 1, limit = 10, search = "") => {
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.$or = [
      { topic: { $regex: search, $options: "i" } },
      { question: { $regex: search, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    SpeakingQuestion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SpeakingQuestion.countDocuments(query),
  ]);

  return { data, total };
};

exports.countTotal = async () => await SpeakingQuestion.countDocuments();

exports.getByPartId = async (partName) =>
  await SpeakingQuestion.find({ part: partName }).sort({ createdAt: -1 });
