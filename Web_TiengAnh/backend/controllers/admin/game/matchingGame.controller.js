const matchingGameService = require("../../../services/game/matchingGame.service");

class MatchingGameAdminController {
  async create(req, res) {
    try {
      const game = await matchingGameService.createMatchingGame(req.body);
      res.status(201).json({ 
        success: true, 
        message: "Tạo matching game thành công", 
        data: game 
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
      const games = await matchingGameService.getAllMatchingGames();
      res.status(200).json({ 
        success: true,
        data: games 
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
      const game = await matchingGameService.getMatchingGameById(req.params.id);
      res.status(200).json({ 
        success: true, 
        data: game 
      });
    } catch (error) {
      res.status(404).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async getByCategory(req, res) {
    try {
      const games = await matchingGameService.getMatchingGamesByCategory(req.params.categoryId);
      res.status(200).json({ 
        success: true,
        data: games 
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
      const updated = await matchingGameService.updateMatchingGame(req.params.id, req.body);
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
      await matchingGameService.deleteMatchingGame(req.params.id);
      res.status(200).json({ 
        success: true, 
        message: "Xóa matching game thành công" 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}

module.exports = new MatchingGameAdminController();