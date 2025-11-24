const wordCardService = require("../../../services/wordguessing/wordCard.service");

class WordCardAdminController {
  async create(req, res) {
    try {
      const card = await wordCardService.createCard(req.body);
      res.status(201).json({ 
        success: true, 
        message: "Tạo card thành công", 
        data: card 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async getAll(req, res) {
    try {
      const cards = await wordCardService.getAllCards();
      res.status(200).json({ 
        success: true,
        data: cards 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  async getById(req, res) {
    try {
      const card = await wordCardService.getCardById(req.params.id);
      res.status(200).json({ 
        success: true, 
        data: card 
      });
    } catch (error) {
      res.status(404).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async getByTopic(req, res) {
    try {
      const cards = await wordCardService.getCardsByTopic(req.params.topicId);
      res.status(200).json({ 
        success: true,
        data: cards 
      });
    } catch (error) {
      res.status(404).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async update(req, res) {
    try {
      const updated = await wordCardService.updateCard(req.params.id, req.body);
      res.status(200).json({ 
        success: true, 
        message: "Cập nhật thành công", 
        data: updated 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async delete(req, res) {
    try {
      await wordCardService.deleteCard(req.params.id);
      res.status(200).json({ 
        success: true, 
        message: "Xóa card thành công" 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}

module.exports = new WordCardAdminController();