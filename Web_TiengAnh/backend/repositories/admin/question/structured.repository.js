const ListeningModel = require("../../../models/listeningQuestion.model");
const ReadingModel = require("../../../models/readingQuestion.model");
const SpeakingModel = require("../../../models/speakingQuestion.model");
const WritingModel = require("../../../models/writingQuestion.model");

const getAllQuestionsWithParts = async () => {
  const [listening, reading, speaking, writing] = await Promise.all([
    ListeningModel.find().populate("part"),
    ReadingModel.find().populate("part"),
    SpeakingModel.find().populate("part"),
    WritingModel.find().populate("part"),
  ]);

  return { listening, reading, speaking, writing };
};

const getPaginated = async (model, page, limit) => {
  const data = await model
    .find()
    .populate("part")
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await model.countDocuments();

  return { data, total };
};

const findById = async (model, id) => {
  return await model.findById(id).populate("part").lean();
};

module.exports = {
  getAllQuestionsWithParts,
  getPaginated,
  findById,
  ListeningModel,
  ReadingModel,
  SpeakingModel,
  WritingModel,
};
