const mongoose = require("mongoose");
const wordTopicRepository = require("../../repositories/wordguessing/wordTopic.repository");

class WordTopicService {
  isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  async createTopic(data) {
    const existingTopic = await wordTopicRepository.findByName(data.name);
    if (existingTopic) {
      throw new Error("Topic đã tồn tại");
    }
    return await wordTopicRepository.create(data);
  }

  async getAllTopics() {
    return await wordTopicRepository.findAll();
  }

  async getTopicById(id) {
    if (!this.isValidObjectId(id)) {
      throw new Error("ID không hợp lệ");
    }

    const topic = await wordTopicRepository.findById(id);
    if (!topic) {
      throw new Error("Topic không tồn tại");
    }
    return topic;
  }

  async updateTopic(id, data) {
    if (!this.isValidObjectId(id)) {
      throw new Error("ID không hợp lệ");
    }

    if (data.name) {
      const existingTopic = await wordTopicRepository.findByName(data.name);
      if (existingTopic && existingTopic._id.toString() !== id) {
        throw new Error("Tên topic đã tồn tại");
      }
    }

    const topic = await wordTopicRepository.updateById(id, data);
    if (!topic) {
      throw new Error("Topic không tồn tại");
    }
    return topic;
  }

  async deleteTopic(id) {
    if (!this.isValidObjectId(id)) {
      throw new Error("ID không hợp lệ");
    }

    const topic = await wordTopicRepository.deleteById(id);
    if (!topic) {
      throw new Error("Topic không tồn tại");
    }
    return true;
  }

  async updateTotalCards(topicId) {
    return await wordTopicRepository.updateTotalCards(topicId);
  }
}

module.exports = new WordTopicService();
