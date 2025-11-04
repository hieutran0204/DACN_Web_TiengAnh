// const ListeningQuestionService = require("../../services/listening/listeningQuestion.service");
// const mongoose = require("mongoose");

// class ListeningQuestionController {
//   async create(req, res) {
//     try {
//       const audioFile = req.files?.audio?.[0];
//       const imageFile = req.files?.image?.[0];

//       const audioUrl = audioFile
//         ? `/uploads/listening/audio/${audioFile.filename}`
//         : null;
//       const imageUrl = imageFile
//         ? `/uploads/listening/image/${imageFile.filename}`
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

//       questionData.audio = audioUrl;
//       questionData.image = imageUrl;

//       const question =
//         await ListeningQuestionService.createListeningQuestion(questionData);
//       res.status(201).json({ success: true, data: question });
//     } catch (error) {
//       console.error("Lỗi tạo câu hỏi:", error);
//       res.status(400).json({ success: false, message: error.message });
//     }
//   }

//   async getById(req, res) {
//     try {
//       const question = await ListeningQuestionService.getListeningQuestionById(
//         req.params.id
//       );
//       if (!question) throw new Error("Câu hỏi không tồn tại");

//       // Populate part để lấy name
//       const populatedQuestion = await question.populate("part", "name");
//       res.status(200).json({ success: true, data: populatedQuestion });
//     } catch (error) {
//       res.status(404).json({ success: false, message: error.message });
//     }
//   }

//   async getAll(req, res) {
//     try {
//       const questions =
//         await ListeningQuestionService.getAllListeningQuestions();
//       res.status(200).json({ success: true, data: questions });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   }

//   async update(req, res) {
//     try {
//       const audioFile = req.files?.audio?.[0];
//       const imageFile = req.files?.image?.[0];

//       const questionData = { ...req.body };

//       // Chỉ chuyển đổi part thành ObjectId nếu là chuỗi hợp lệ, nếu không giữ nguyên
//       if (questionData.part && typeof questionData.part === "string") {
//         if (mongoose.Types.ObjectId.isValid(questionData.part)) {
//           questionData.part = new mongoose.Types.ObjectId(questionData.part); // Sử dụng new
//         } else {
//           throw new Error("Giá trị part không hợp lệ");
//         }
//       } else if (questionData.part && typeof questionData.part !== "object") {
//         throw new Error("Giá trị part không hợp lệ");
//       }

//       // Update audio/image only if new file or URL is provided
//       if (audioFile) {
//         questionData.audio = `/uploads/listening/audio/${audioFile.filename}`;
//       } else if (req.body.audio) {
//         questionData.audio = req.body.audio;
//       }

//       if (imageFile) {
//         questionData.image = `/uploads/listening/image/${imageFile.filename}`;
//       } else if (req.body.image) {
//         questionData.image = req.body.image;
//       }

//       const question = await ListeningQuestionService.updateListeningQuestion(
//         req.params.id,
//         questionData
//       );
//       res.status(200).json({ success: true, data: question });
//     } catch (error) {
//       res.status(400).json({ success: false, message: error.message });
//     }
//   }

//   async delete(req, res) {
//     try {
//       await ListeningQuestionService.deleteListeningQuestion(req.params.id);
//       res.status(200).json({ success: true, message: "Câu hỏi đã xóa" });
//     } catch (error) {
//       res.status(404).json({ success: false, message: error.message });
//     }
//   }

//   async getByPart(req, res) {
//     try {
//       const partId = new mongoose.Types.ObjectId(req.params.partId); // Sử dụng new
//       const questions =
//         await ListeningQuestionService.getQuestionsByPart(partId);
//       res.status(200).json({ success: true, data: questions });
//     } catch (error) {
//       res.status(404).json({ success: false, message: error.message });
//     }
//   }
//   async getAllPaginated(req, res) {
//     try {
//       const page = parseInt(req.query.page) || 1;
//       const limit = parseInt(req.query.limit) || 10;

//       const result = await ListeningQuestionService.getPaginatedQuestions(
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

// module.exports = new ListeningQuestionController();

const ListeningQuestionService = require("../../services/listening/listeningQuestion.service");
const mongoose = require("mongoose");

class ListeningQuestionController {
  // ✅ [POST] /api/listening
  async create(req, res) {
    try {
      const audioFile = req.files?.audio?.[0];
      const imageFile = req.files?.image?.[0];

      const audioUrl = audioFile
        ? `/uploads/listening/audio/${audioFile.filename}`
        : null;
      const imageUrl = imageFile
        ? `/uploads/listening/image/${imageFile.filename}`
        : null;

      const questionData = { ...req.body };

      // 🔹 Đổi part → section (và validate)
      if (
        questionData.section &&
        typeof questionData.section === "string" &&
        mongoose.Types.ObjectId.isValid(questionData.section)
      ) {
        questionData.section = new mongoose.Types.ObjectId(
          questionData.section
        );
      } else {
        throw new Error("Giá trị section không hợp lệ");
      }

      questionData.audio = audioUrl;
      questionData.image = imageUrl;

      const question =
        await ListeningQuestionService.createListeningQuestion(questionData);

      res.status(201).json({ success: true, data: question });
    } catch (error) {
      console.error("Lỗi tạo câu hỏi:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ✅ [GET] /api/listening/:id
  async getById(req, res) {
    try {
      const question = await ListeningQuestionService.getListeningQuestionById(
        req.params.id
      );
      if (!question) throw new Error("Câu hỏi không tồn tại");

      // 🔹 Populate section thay vì part
      const populatedQuestion = await question.populate("section", "name");
      res.status(200).json({ success: true, data: populatedQuestion });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // ✅ [GET] /api/listening
  async getAll(req, res) {
    try {
      const questions =
        await ListeningQuestionService.getAllListeningQuestions();
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ✅ [PUT] /api/listening/:id
  async update(req, res) {
    try {
      const audioFile = req.files?.audio?.[0];
      const imageFile = req.files?.image?.[0];
      const questionData = { ...req.body };

      // 🔹 Chuyển đổi section hợp lệ
      if (questionData.section && typeof questionData.section === "string") {
        if (mongoose.Types.ObjectId.isValid(questionData.section)) {
          questionData.section = new mongoose.Types.ObjectId(
            questionData.section
          );
        } else {
          throw new Error("Giá trị section không hợp lệ");
        }
      } else if (
        questionData.section &&
        typeof questionData.section !== "object"
      ) {
        throw new Error("Giá trị section không hợp lệ");
      }

      // 🔹 Update audio/image nếu có
      if (audioFile) {
        questionData.audio = `/uploads/listening/audio/${audioFile.filename}`;
      } else if (req.body.audio) {
        questionData.audio = req.body.audio;
      }

      if (imageFile) {
        questionData.image = `/uploads/listening/image/${imageFile.filename}`;
      } else if (req.body.image) {
        questionData.image = req.body.image;
      }

      const question = await ListeningQuestionService.updateListeningQuestion(
        req.params.id,
        questionData
      );

      res.status(200).json({ success: true, data: question });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ✅ [DELETE] /api/listening/:id
  async delete(req, res) {
    try {
      await ListeningQuestionService.deleteListeningQuestion(req.params.id);
      res.status(200).json({ success: true, message: "Câu hỏi đã được xóa" });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // ✅ [GET] /api/listening/section/:sectionId
  async getBySection(req, res) {
    try {
      const sectionId = new mongoose.Types.ObjectId(req.params.sectionId);
      const questions =
        await ListeningQuestionService.getQuestionsBySection(sectionId);
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // ✅ [GET] /api/listening/paginated?page=1&limit=10
  async getAllPaginated(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await ListeningQuestionService.getPaginatedQuestions(
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

module.exports = new ListeningQuestionController();
