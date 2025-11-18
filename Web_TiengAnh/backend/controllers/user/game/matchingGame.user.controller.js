// controllers/user/game/matchingGame.user.controller.js
const matchingGameService = require("../../../services/game/matchingGame.service");

class MatchingGameUserController {
  async getRandomGame(req, res) {
    try {
      const { categoryId } = req.params;
      const game = await matchingGameService.getRandomGameByCategory(categoryId);
      
      res.status(200).json({ 
        success: true, 
        data: game 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async getGamesByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const games = await matchingGameService.getMatchingGamesByCategory(categoryId);
      
      res.status(200).json({ 
        success: true, 
        data: games,
        count: games.length
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}

module.exports = new MatchingGameUserController();