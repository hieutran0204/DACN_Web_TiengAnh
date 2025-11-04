const repo = require("../../repositories/admin/question/structured.repository");

function groupByPart(questions) {
  const map = {};
  questions.forEach((q) => {
    const partName = q.part?.name || "Unknown Part";
    if (!map[partName]) map[partName] = [];
    map[partName].push(q);
  });
  return map;
}

const getStructuredQuestions = async () => {
  const { listening, reading, speaking, writing } =
    await repo.getAllQuestionsWithParts();
  return {
    listening: groupByPart(listening),
    reading: groupByPart(reading),
    speaking: groupByPart(speaking),
    writing: groupByPart(writing),
  };
};

const getPaginatedQuestions = async (skillName, page = 1, limit = 10) => {
  let model;

  switch (skillName.toLowerCase()) {
    case "listening":
      model = repo.ListeningModel;
      break;
    case "reading":
      model = repo.ReadingModel;
      break;
    case "speaking":
      model = repo.SpeakingModel;
      break;
    case "writing":
      model = repo.WritingModel;
      break;
    default:
      throw new Error("Skill không hợp lệ");
  }

  return await repo.getPaginated(model, page, limit);
};

const getQuestionById = async (id) => {
  const models = {
    listening: repo.ListeningModel,
    reading: repo.ReadingModel,
    speaking: repo.SpeakingModel,
    writing: repo.WritingModel,
  };

  // Kiểm tra từng model để tìm câu hỏi
  for (const [skill, model] of Object.entries(models)) {
    const question = await repo.findById(model, id);
    if (question) {
      return { ...question, skill };
    }
  }
  throw new Error("Câu hỏi không tồn tại");
};

module.exports = {
  getStructuredQuestions,
  getPaginatedQuestions,
  getQuestionById,
};
