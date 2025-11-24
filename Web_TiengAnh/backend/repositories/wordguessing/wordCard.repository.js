const WordCard = require("../../models/wordguessing/wordCard.model");

class WordCardRepository {
  async create(data) {
    return await WordCard.create(data);
  }

  async findAll() {
    return await WordCard.find()
      .populate('topic', 'name')
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return await WordCard.findById(id).populate('topic', 'name');
  }

  async findByTopic(topicId) {
    return await WordCard.find({ topic: topicId })
      .populate('topic', 'name')
      .sort({ createdAt: -1 });
  }

  async findRandomByTopic(topicId, limit = 1) {
    return await WordCard.aggregate([
      { $match: { topic: topicId } },
      { $sample: { size: limit } }
    ]);
  }

  async updateById(id, data) {
    return await WordCard.findByIdAndUpdate(id, data, { 
      new: true,
      runValidators: true 
    }).populate('topic', 'name');
  }

  async deleteById(id) {
    return await WordCard.findByIdAndDelete(id);
  }

  async countByTopic(topicId) {
    return await WordCard.countDocuments({ topic: topicId });
  }
}

module.exports = new WordCardRepository();