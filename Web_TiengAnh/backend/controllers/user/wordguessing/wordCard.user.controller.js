const wordCardService = require("../../../services/wordguessing/wordCard.service");

class WordCardUserController {
  async getRandomCard(req, res) {
    try {
      const { topicId } = req.params;
      const card = await wordCardService.getRandomCardByTopic(topicId);

      res.status(200).json({
        success: true,
        data: card,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCardsByTopic(req, res) {
    try {
      const { topicId } = req.params;
      const cards = await wordCardService.getCardsByTopic(topicId);

      res.status(200).json({
        success: true,
        data: cards,
        count: cards.length,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new WordCardUserController();
