const wordService = require("../../services/game/word.service");
const categoryService = require("../../services/game/category.service");

class GameUserController {
  async getAllCategories(req, res) {
    try {
      const categories = await categoryService.getAllCategories();
      res.status(200).json({ data: categories });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getRandomWord(req, res) {
    try {
      const { categoryId } = req.params;
      const word = await wordService.getRandomWordByCategory(categoryId);
      res.status(200).json({ data: word });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async checkAnswer(req, res) {
  try {
    const { wordId, userAnswer } = req.body;
    const word = await wordService.getWordById(wordId);
    
    const isCorrect = word.word.trim().toLowerCase() === userAnswer.trim().toLowerCase();
    
    res.status(200).json({ 
      isCorrect,
      correctAnswer: word.word,
      meaning: word.meaning,
      usage: word.usage,
      example: word.example
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
}

module.exports = new GameUserController();