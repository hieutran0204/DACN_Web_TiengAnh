const WordTopic = require("../../models/wordguessing/wordTopic.model");

class WordTopicRepository {
  async create(data) {
    return await WordTopic.create(data);
  }

  async findAll() {
    return await WordTopic.find().sort({ createdAt: -1 });
  }

  async findById(id) {
    return await WordTopic.findById(id);
  }

  async findByName(name) {
    if (!name) return null;

    // Escape ký tự đặc biệt trong regex
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return await WordTopic.findOne({
      name: new RegExp("^" + escapedName + "$", "i"),
    });
  }

  async updateById(id, data) {
    return await WordTopic.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id) {
    return await WordTopic.findByIdAndDelete(id);
  }

  async updateTotalCards(topicId) {
    const WordCard = require("../../models/wordguessing/wordCard.model");
    const count = await WordCard.countDocuments({ topic: topicId });
    return await WordTopic.findByIdAndUpdate(
      topicId,
      { totalCards: count },
      { new: true }
    );
  }
}

module.exports = new WordTopicRepository();
