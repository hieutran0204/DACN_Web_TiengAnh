const mongoose = require("mongoose");
const wordCardRepository = require("../../repositories/wordguessing/wordCard.repository");
const wordTopicRepository = require("../../repositories/wordguessing/wordTopic.repository");

class WordCardService {
  isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  async createCard(data) {
    if (!this.isValidObjectId(data.topic)) {
      throw new Error("Topic ID không hợp lệ");
    }

    const topic = await wordTopicRepository.findById(data.topic);
    if (!topic) {
      throw new Error("Topic không tồn tại");
    }

    const card = await wordCardRepository.create(data);

    // Cập nhật totalCards của topic
    await wordTopicRepository.updateTotalCards(data.topic);

    return card;
  }

  async getAllCards() {
    return await wordCardRepository.findAll();
  }

  async getCardById(id) {
    if (!this.isValidObjectId(id)) {
      throw new Error("ID không hợp lệ");
    }

    const card = await wordCardRepository.findById(id);
    if (!card) {
      throw new Error("Card không tồn tại");
    }
    return card;
  }

  async getCardsByTopic(topicId) {
    if (!this.isValidObjectId(topicId)) {
      throw new Error("Topic ID không hợp lệ");
    }

    return await wordCardRepository.findByTopic(topicId);
  }

  async getRandomCardByTopic(topicId) {
    if (!this.isValidObjectId(topicId)) {
      throw new Error("Topic ID không hợp lệ");
    }

    const cards = await wordCardRepository.findRandomByTopic(
      new mongoose.Types.ObjectId(topicId),
      1
    );

    if (cards.length === 0) {
      throw new Error("Chưa có card nào cho topic này");
    }

    // Populate topic manually
    const WordTopic = require("../../models/wordguessing/wordTopic.model");
    const topic = await WordTopic.findById(topicId);
    cards[0].topic = topic;

    return cards[0];
  }

  async updateCard(id, data) {
    if (!this.isValidObjectId(id)) {
      throw new Error("ID không hợp lệ");
    }

    if (data.topic && !this.isValidObjectId(data.topic)) {
      throw new Error("Topic ID không hợp lệ");
    }

    const oldCard = await wordCardRepository.findById(id);
    if (!oldCard) {
      throw new Error("Card không tồn tại");
    }

    const card = await wordCardRepository.updateById(id, data);

    // Nếu đổi topic, cập nhật totalCards của cả 2 topic
    if (data.topic && data.topic !== oldCard.topic.toString()) {
      await wordTopicRepository.updateTotalCards(oldCard.topic);
      await wordTopicRepository.updateTotalCards(data.topic);
    }

    return card;
  }

  async deleteCard(id) {
    if (!this.isValidObjectId(id)) {
      throw new Error("ID không hợp lệ");
    }

    const card = await wordCardRepository.findById(id);
    if (!card) {
      throw new Error("Card không tồn tại");
    }

    const topicId = card.topic._id;
    await wordCardRepository.deleteById(id);

    // Cập nhật totalCards
    await wordTopicRepository.updateTotalCards(topicId);

    return true;
  }
}

module.exports = new WordCardService();
