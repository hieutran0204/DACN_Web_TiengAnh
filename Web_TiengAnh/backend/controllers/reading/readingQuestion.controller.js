// const ReadingQuestionService = require("../../services/reading/readingQuestion.service");
// const mongoose = require("mongoose");

// // Thêm BASE_URL từ biến môi trường
// const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// class ReadingQuestionController {
//   async create(req, res) {
//     try {
//       const imageFile = req.files?.image?.[0];
//       // Sửa URL hình ảnh để bao gồm BASE_URL
//       const imageUrl = imageFile
//         ? `${BASE_URL}/uploads/reading/image/${imageFile.filename}`
//         : null;

//       const questionData = { ...req.body };
//       if (
//         questionData.part &&
//         typeof questionData.part === "string" &&
//         mongoose.Types.ObjectId.isValid(questionData.part)
//       ) {
//         questionData.part = new mongoose.Types.ObjectId(questionData.part);
//       } else {
//         throw new Error("Giá trị part không hợp lệ");
//       }

//       questionData.image = imageUrl;

//       const question =
//         await ReadingQuestionService.createReadingQuestion(questionData);
//       res.status(201).json({ success: true, data: question });
//     } catch (error) {
//       console.error("Lỗi tạo câu hỏi:", error);
//       res.status(400).json({ success: false, message: error.message });
//     }
//   }

//   async update(req, res) {
//     try {
//       const imageFile = req.files?.image?.[0];
//       const questionData = { ...req.body };

//       if (
//         questionData.part &&
//         typeof questionData.part === "string" &&
//         mongoose.Types.ObjectId.isValid(questionData.part)
//       ) {
//         questionData.part = new mongoose.Types.ObjectId(questionData.part);
//       } else if (questionData.part && typeof questionData.part !== "object") {
//         throw new Error("Giá trị part không hợp lệ");
//       }

//       if (imageFile) {
//         // Sửa URL hình ảnh để bao gồm BASE_URL
//         questionData.image = `${BASE_URL}/uploads/reading/image/${imageFile.filename}`;
//       } else if (req.body.image) {
//         // Nếu image là URL tương đối, thêm BASE_URL; nếu là tuyệt đối, giữ nguyên
//         questionData.image = req.body.image.startsWith("/")
//           ? `${BASE_URL}${req.body.image}`
//           : req.body.image;
//       }

//       const question = await ReadingQuestionService.updateReadingQuestion(
//         req.params.id,
//         questionData
//       );
//       res.status(200).json({ success: true, data: question });
//     } catch (error) {
//       res.status(400).json({ success: false, message: error.message });
//     }
//   }

//   async getById(req, res) {
//     try {
//       const question = await ReadingQuestionService.getReadingQuestionById(
//         req.params.id
//       );
//       if (!question) throw new Error("Câu hỏi không tồn tại");

//       const populatedQuestion = await question.populate("part", "name");
//       res.status(200).json({ success: true, data: populatedQuestion });
//     } catch (error) {
//       res.status(404).json({ success: false, message: error.message });
//     }
//   }

//   async getAll(req, res) {
//     try {
//       const questions = await ReadingQuestionService.getAllReadingQuestions();
//       res.status(200).json({ success: true, data: questions });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   }

//   async delete(req, res) {
//     try {
//       await ReadingQuestionService.deleteReadingQuestion(req.params.id);
//       res.status(200).json({ success: true, message: "Câu hỏi đã xóa" });
//     } catch (error) {
//       res.status(404).json({ success: false, message: error.message });
//     }
//   }

//   async getByPart(req, res) {
//     try {
//       const partId = new mongoose.Types.ObjectId(req.params.partId);
//       const questions = await ReadingQuestionService.getQuestionsByPart(partId);
//       res.status(200).json({ success: true, data: questions });
//     } catch (error) {
//       res.status(404).json({ success: false, message: error.message });
//     }
//   }
//   async getAllPaginated(req, res) {
//     try {
//       const page = parseInt(req.query.page) || 1;
//       const limit = parseInt(req.query.limit) || 10;

//       const result = await ReadingQuestionService.getPaginatedQuestions(
//         page,
//         limit
//       );

//       res.status(200).json({
//         success: true,
//         data: result.data,
//         total: result.total,
//         page: result.page,
//         limit: result.limit,
//         totalPages: result.totalPages,
//         hasNextPage: page < result.totalPages,
//         hasPrevPage: page > 1,
//       });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   }
// }

// module.exports = new ReadingQuestionController();

const ReadingQuestionService = require("../../services/reading/readingQuestion.service");
const mongoose = require("mongoose");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

class ReadingQuestionController {
  // ===== CREATE =====
  async create(req, res) {
    try {
      const imageFile = req.files?.image?.[0];
      const imageUrl = imageFile
        ? `${BASE_URL}/uploads/reading/image/${imageFile.filename}`
        : null;

      const questionData = { ...req.body };

      // ⚙️ Không còn part (ObjectId) mà là passage (string)
      if (!questionData.passage || typeof questionData.passage !== "string") {
        throw new Error("Giá trị passage không hợp lệ hoặc bị thiếu");
      }

      questionData.image = imageUrl;

      const passage =
        await ReadingQuestionService.createReadingPassage(questionData);

      res.status(201).json({ success: true, data: passage });
    } catch (error) {
      console.error("Lỗi tạo passage:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ===== UPDATE =====
  async update(req, res) {
    try {
      const imageFile = req.files?.image?.[0];
      const passageData = { ...req.body };

      if (!passageData.passage || typeof passageData.passage !== "string") {
        throw new Error("Giá trị passage không hợp lệ hoặc bị thiếu");
      }

      if (imageFile) {
        passageData.image = `${BASE_URL}/uploads/reading/image/${imageFile.filename}`;
      } else if (req.body.image) {
        passageData.image = req.body.image.startsWith("/")
          ? `${BASE_URL}${req.body.image}`
          : req.body.image;
      }

      const passage = await ReadingQuestionService.updateReadingPassage(
        req.params.id,
        passageData
      );

      res.status(200).json({ success: true, data: passage });
    } catch (error) {
      console.error("Lỗi cập nhật passage:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ===== GET BY ID =====
  async getById(req, res) {
    try {
      const passage = await ReadingQuestionService.getReadingPassageById(
        req.params.id
      );
      if (!passage) throw new Error("Passage không tồn tại");

      res.status(200).json({ success: true, data: passage });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // ===== GET ALL =====
  async getAll(req, res) {
    try {
      const passages = await ReadingQuestionService.getAllReadingPassages();
      res.status(200).json({ success: true, data: passages });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ===== DELETE =====
  async delete(req, res) {
    try {
      await ReadingQuestionService.deleteReadingPassage(req.params.id);
      res.status(200).json({ success: true, message: "Passage đã được xóa" });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // ===== PAGINATION =====
  async getAllPaginated(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await ReadingQuestionService.getPaginatedPassages(
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: page < result.totalPages,
        hasPrevPage: page > 1,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ReadingQuestionController();
