const newsService = require("../../../services/news/news.service");

class NewsUserController {
  async getAll(req, res) {
    try {
      const newsList = await newsService.getAllNews();
      res.status(200).json({ data: newsList });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const news = await newsService.getNewsById(req.params.id);
      // Remove answers before sending to client if needed? 
      // Current implementation sends everything including correctAnswer? 
      // Previous frontend checks answer by sending request to server?
      // Yes, previously it seemed to send answer to server.
      // But wait, if getById sends `correctAnswer`, the user can just cheat.
      // Ideally we shouldn't send `correctAnswer` in getById.
      // But for now let's keep it simple or remove it.
      // If I remove it, I must implement checkAnswer properly.
      
      const newsObj = news.toObject();
      // Hide correct answers from user
      if (newsObj.questions) {
        newsObj.questions = newsObj.questions.map(q => {
          const { correctAnswer, ...rest } = q;
          return rest;
        });
      }
      res.status(200).json({ data: newsObj });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async checkAnswer(req, res) {
    try {
      const { id } = req.params;
      const { answers } = req.body; // e.g., { questionId1: 0, questionId2: 1 } or array [0, 1, 2]
      
      const news = await newsService.getNewsById(id);
      
      if (!answers) {
        return res.status(400).json({ message: "Vui lòng gửi đáp án" });
      }

      const results = news.questions.map((q, index) => {
        const userAnswer = Array.isArray(answers) ? answers[index] : answers[q._id];
        const isCorrect = userAnswer === q.correctAnswer;
        return {
          questionId: q._id,
          isCorrect,
          correctAnswer: q.correctAnswer
        };
      });

      const totalCorrect = results.filter(r => r.isCorrect).length;

      res.status(200).json({
        correct: totalCorrect === news.questions.length,
        results,
        totalCorrect,
        totalQuestions: news.questions.length
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new NewsUserController();
