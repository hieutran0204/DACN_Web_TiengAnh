// // // const WritingQuestionService = require("../../services/writing/writingQuestion.service");
// // // const mongoose = require("mongoose");

// // // const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// // // class WritingQuestionController {
// // //   async create(req, res) {
// // //     try {
// // //       const imageFile = req.files?.image?.[0];
// // //       const imageUrl = imageFile
// // //         ? `${BASE_URL}/uploads/writing/image/${imageFile.filename}`
// // //         : null;

// // //       const {
// // //         skill,
// // //         task,
// // //         type,
// // //         topic,
// // //         question,
// // //         suggestedIdeas,
// // //         sampleAnswer,
// // //         difficulty,
// // //       } = req.body;

// // //       if (!skill || !task || !type || !topic || !question) {
// // //         return res.status(400).json({
// // //           success: false,
// // //           message:
// // //             "Thiếu thông tin bắt buộc: skill, task, type, topic, question",
// // //         });
// // //       }

// // //       const questionData = {
// // //         skill,
// // //         part,
// // //         task,
// // //         type,
// // //         topic,
// // //         question,
// // //         suggestedIdeas: Array.isArray(suggestedIdeas)
// // //           ? suggestedIdeas
// // //           : suggestedIdeas
// // //             ? [suggestedIdeas]
// // //             : [],
// // //         sampleAnswer: sampleAnswer || "",
// // //         difficulty: difficulty || "medium",
// // //         image: imageUrl,
// // //       };

// // //       const createdQuestion =
// // //         await WritingQuestionService.createWritingQuestion(questionData);

// // //       res.status(201).json({ success: true, data: createdQuestion });
// // //     } catch (error) {
// // //       console.error("Lỗi tạo câu hỏi Writing:", error);
// // //       res.status(400).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   async update(req, res) {
// // //     try {
// // //       const imageFile = req.files?.image?.[0];
// // //       const {
// // //         skill,
// // //         part,
// // //         task,
// // //         type,
// // //         topic,
// // //         question,
// // //         suggestedIdeas,
// // //         sampleAnswer,
// // //         difficulty,
// // //       } = req.body;

// // //       if (!skill || !part || !task || !type || !topic || !question) {
// // //         return res.status(400).json({
// // //           success: false,
// // //           message:
// // //             "Thiếu thông tin bắt buộc: skill, part, task, type, topic, question",
// // //         });
// // //       }

// // //       const questionData = {
// // //         skill,
// // //         part,
// // //         task,
// // //         type,
// // //         topic,
// // //         question,
// // //         suggestedIdeas: Array.isArray(suggestedIdeas)
// // //           ? suggestedIdeas
// // //           : suggestedIdeas
// // //             ? [suggestedIdeas]
// // //             : [],
// // //         sampleAnswer: sampleAnswer || "",
// // //         difficulty: difficulty || "medium",
// // //       };

// // //       if (imageFile) {
// // //         questionData.image = `${BASE_URL}/uploads/writing/image/${imageFile.filename}`;
// // //       } else if (req.body.image) {
// // //         questionData.image = req.body.image.startsWith("/")
// // //           ? `${BASE_URL}${req.body.image}`
// // //           : req.body.image;
// // //       }

// // //       const updatedQuestion =
// // //         await WritingQuestionService.updateWritingQuestion(
// // //           req.params.id,
// // //           questionData
// // //         );

// // //       res.status(200).json({ success: true, data: updatedQuestion });
// // //     } catch (error) {
// // //       console.error("Lỗi cập nhật câu hỏi Writing:", error);
// // //       res.status(400).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   async getById(req, res) {
// // //     try {
// // //       const foundQuestion = await WritingQuestionService.getWritingQuestionById(
// // //         req.params.id
// // //       );
// // //       if (!foundQuestion) throw new Error("Câu hỏi không tồn tại");

// // //       res.status(200).json({ success: true, data: foundQuestion });
// // //     } catch (error) {
// // //       res.status(404).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   async getAll(req, res) {
// // //     try {
// // //       const questions = await WritingQuestionService.getAllWritingQuestions();
// // //       res.status(200).json({ success: true, data: questions });
// // //     } catch (error) {
// // //       res.status(500).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   async delete(req, res) {
// // //     try {
// // //       await WritingQuestionService.deleteWritingQuestion(req.params.id);
// // //       res.status(200).json({ success: true, message: "Câu hỏi đã xóa" });
// // //     } catch (error) {
// // //       res.status(404).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   async getByPart(req, res) {
// // //     try {
// // //       const partId = req.params.partId;
// // //       const questions = await WritingQuestionService.getQuestionsByPart(partId);
// // //       res.status(200).json({ success: true, data: questions });
// // //     } catch (error) {
// // //       res.status(404).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   async getAllPaginated(req, res) {
// // //     try {
// // //       const page = parseInt(req.query.page) || 1;
// // //       const limit = parseInt(req.query.limit) || 10;

// // //       const result = await WritingQuestionService.getPaginatedQuestions(
// // //         page,
// // //         limit
// // //       );

// // //       res.status(200).json({
// // //         success: true,
// // //         data: result.data,
// // //         total: result.total,
// // //         page: result.page,
// // //         limit: result.limit,
// // //         totalPages: result.totalPages,
// // //         hasNextPage: page < result.totalPages,
// // //         hasPrevPage: page > 1,
// // //       });
// // //     } catch (error) {
// // //       res.status(500).json({ success: false, message: error.message });
// // //     }
// // //   }
// // // }

// // // module.exports = new WritingQuestionController();

// // const WritingQuestionService = require("../../services/writing/writingQuestion.service");
// // const mongoose = require("mongoose");

// // const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// // class WritingQuestionController {
// //   async create(req, res) {
// //     try {
// //       const imageFile = req.files?.image?.[0];
// //       const imageUrl = imageFile
// //         ? `${BASE_URL}/uploads/writing/image/${imageFile.filename}`
// //         : null;

// //       const { task, type, topic, question, sampleAnswer, difficulty } =
// //         req.body;

// //       if (!task || !type || !topic || !question) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "Thiếu thông tin bắt buộc: task, type, topic, question",
// //         });
// //       }

// //       const questionData = {
// //         skill: "writing", // ← TỰ ĐỘNG GÁN NHƯ SPEAKING
// //         task,
// //         type,
// //         topic,
// //         question,
// //         sampleAnswer: sampleAnswer || "",
// //         image: imageUrl,
// //         difficulty: difficulty || "medium",
// //       };

// //       const created =
// //         await WritingQuestionService.createWritingQuestion(questionData);
// //       res.status(201).json({ success: true, data: created });
// //     } catch (error) {
// //       console.error("Lỗi tạo Writing:", error);
// //       res.status(400).json({ success: false, message: error.message });
// //     }
// //   }

// //   async update(req, res) {
// //     try {
// //       const imageFile = req.files?.image?.[0];
// //       const { task, type, topic, question, sampleAnswer, difficulty } =
// //         req.body;

// //       if (!task || !type || !topic || !question) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "Thiếu thông tin bắt buộc",
// //         });
// //       }

// //       const questionData = {
// //         skill: "writing", // ← TỰ ĐỘNG GÁN NHƯ SPEAKING
// //         task,
// //         type,
// //         topic,
// //         question,
// //         sampleAnswer: sampleAnswer || "",
// //         difficulty: difficulty || "medium",
// //       };

// //       if (imageFile) {
// //         questionData.image = `${BASE_URL}/uploads/writing/image/${imageFile.filename}`;
// //       }

// //       const updated = await WritingQuestionService.updateWritingQuestion(
// //         req.params.id,
// //         questionData
// //       );
// //       res.status(200).json({ success: true, data: updated });
// //     } catch (error) {
// //       console.error("Lỗi update Writing:", error);
// //       res.status(400).json({ success: false, message: error.message });
// //     }
// //   }

// //   // Các hàm còn lại giữ nguyên 100% như Speaking
// //   async getById(req, res) {
// //     try {
// //       const foundQuestion = await WritingQuestionService.getWritingQuestionById(
// //         req.params.id
// //       );
// //       if (!foundQuestion) throw new Error("Câu hỏi không tồn tại");
// //       res.status(200).json({ success: true, data: foundQuestion });
// //     } catch (error) {
// //       res.status(404).json({ success: false, message: error.message });
// //     }
// //   }

// //   async getAll(req, res) {
// //     try {
// //       const questions = await WritingQuestionService.getAllWritingQuestions();
// //       // TRẢ VỀ ĐÚNG ĐỊNH DẠNG FRONTEND MUỐN!!!
// //       res.status(200).json({
// //         success: true,
// //         data: questions, // ← ĐÂY LÀ CHÌA KHÓA!!!
// //       });
// //     } catch (error) {
// //       res.status(500).json({ success: false, message: error.message });
// //     }
// //   }

// //   async delete(req, res) {
// //     try {
// //       await WritingQuestionService.deleteWritingQuestion(req.params.id);
// //       res.status(200).json({ success: true, message: "Câu hỏi đã xóa" });
// //     } catch (error) {
// //       res.status(404).json({ success: false, message: error.message });
// //     }
// //   }

// //   async getAllPaginated(req, res) {
// //     try {
// //       const page = parseInt(req.query.page) || 1;
// //       const limit = parseInt(req.query.limit) || 10;

// //       const result = await WritingQuestionService.getPaginatedQuestions(
// //         page,
// //         limit
// //       );

// //       res.status(200).json({
// //         success: true,
// //         data: result.data,
// //         total: result.total,
// //         page: result.page,
// //         limit: result.limit,
// //         totalPages: result.totalPages,
// //         hasNextPage: page < result.totalPages,
// //         hasPrevPage: page > 1,
// //       });
// //     } catch (error) {
// //       res.status(500).json({ success: false, message: error.message });
// //     }
// //   }
// //   async getByPart(req, res) {
// //     try {
// //       const partId = req.params.partId;
// //       const questions = await WritingQuestionService.getQuestionsByPart(partId);
// //       res.status(200).json({ success: true, data: questions });
// //     } catch (error) {
// //       res.status(404).json({ success: false, message: error.message });
// //     }
// //   }
// // }

// // module.exports = new WritingQuestionController();

// const WritingQuestionService = require("../../services/writing/writingQuestion.service");
// const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// class WritingQuestionController {
//   async create(req, res) {
//     try {
//       const imageFile = req.files?.image?.[0];
//       const imageUrl = imageFile
//         ? `${BASE_URL}/uploads/writing/image/${imageFile.filename}`
//         : null;

//       const { task, type, topic, question, sampleAnswer, difficulty } =
//         req.body;

//       if (!task || !type || !topic || !question) {
//       }

//       const questionData = {
//         skill: "writing",
//         task,
//         type,
//         topic,
//         question,
//         sampleAnswer: sampleAnswer || "",
//         image: imageUrl,
//         difficulty: difficulty || "medium",
//       };

//       const created =
//         await WritingQuestionService.createWritingQuestion(questionData);
//       res.status(201).json({ success: true, data: created });
//     } catch (error) {
//       console.error("Lỗi tạo Writing:", error);
//       res.status(400).json({ success: false, message: error.message });
//     }
//   }

//   async update(req, res) {
//     try {
//       const imageFile = req.files?.image?.[0];
//       const { task, type, topic, question, sampleAnswer, difficulty } =
//         req.body;

//       if (!task || !type || !topic || !question) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Thiếu thông tin bắt buộc" });
//       }

//       const questionData = {
//         skill: "writing",
//         task,
//         type,
//         topic,
//         question,
//         sampleAnswer: sampleAnswer || "",
//         difficulty: difficulty || "medium",
//       };

//       if (imageFile) {
//         questionData.image = `${BASE_URL}/uploads/writing/image/${imageFile.filename}`;
//       }

//       const updated = await WritingQuestionService.updateWritingQuestion(
//         req.params.id,
//         questionData
//       );
//       res.status(200).json({ success: true, data: updated });
//     } catch (error) {
//       console.error("Lỗi update Writing:", error);
//       res.status(400).json({ success: false, message: error.message });
//     }
//   }

//   async getById(req, res) {
//     try {
//       const question = await WritingQuestionService.getWritingQuestionById(
//         req.params.id
//       );
//       res.status(200).json({ success: true, data: question });
//     } catch (error) {
//       res.status(404).json({ success: false, message: error.message });
//     }
//   }

//   // CHỖ NÀY LÀ CHÌA KHÓA – TRẢ ĐÚNG ĐỊNH DẠNG CHO FRONTEND
//   async getAll(req, res) {
//     try {
//       const questions = await WritingQuestionService.getAllWritingQuestions();
//       res.status(200).json({
//         success: true,
//         data: questions, // ← PHẢI CÓ DÒNG NÀY!!!
//       });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   }

//   async delete(req, res) {
//     try {
//       await WritingQuestionService.deleteWritingQuestion(req.params.id);
//       res.status(200).json({ success: true, message: "Xóa thành công!" });
//     } catch (error) {
//       res.status(404).json({ success: false, message: error.message });
//     }
//   }

//   // Giữ lại để sau này làm phân trang nếu cần
//   async getAllPaginated(req, res) {
//     try {
//       const page = parseInt(req.query.page) || 1;
//       const limit = parseInt(req.query.limit) || 10;
//       const result = await WritingQuestionService.getPaginatedQuestions(
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
//       });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   }
//   async getByPart(req, res) {
//     try {
//       const partId = req.params.partId;
//       if (!partId || !mongoose.Types.ObjectId.isValid(partId)) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Part ID không hợp lệ" });
//       }
//       const questions =
//         (await WritingQuestionService.getQuestionsByPart?.(partId)) ||
//         (await WritingQuestionService.getPaginatedQuestions(1, 100)); // fallback

//       // Nếu service không có hàm này thì fallback lấy tất cả
//       res.status(200).json({ success: true, data: questions });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   }
//   // THÊM HÀM NÀY ĐỂ DỰ PHÒNG – CHẠY NGON 100% KHÔNG LỖI
//   async getAllSimple(req, res) {
//     try {
//       const questions = await WritingQuestionService.getAllWritingQuestions();
//       res.status(200).json({ success: true, data: questions });
//     } catch (error) {
//       console.error("Lỗi getAllSimple:", error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   }
// }

// module.exports = new WritingQuestionController();
const WritingQuestionService = require("../../services/writing/writingQuestion.service");
const mongoose = require("mongoose");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

class WritingQuestionController {
  // TẠO MỚI – CHUẨN NHƯ SPEAKING
  async create(req, res) {
    console.log("🔥 [DEBUG] ENTERING CONTROLLER CREATE METHOD 🔥");
    try {
      // Middleware has processed uploads and put URLs into req.body.images (if any)
      const uploadedImages = req.body.images || [];

      // Combine with any provided image URLs (though create usually doesn't have them unless pure JSON)
      const finalImages = [...uploadedImages];

      // Backward compatibility: set first image to 'image' field
      const legacyImage = finalImages.length > 0 ? finalImages[0] : null;

      const { task, type, topic, question, sampleAnswer, difficulty } = req.body;

      const questionData = {
        skill: "writing",
        task,
        type,
        topic,
        question,
        sampleAnswer: sampleAnswer || "",
        image: legacyImage, 
        images: finalImages,
        difficulty: difficulty || "medium",
      };

      const created =
        await WritingQuestionService.createWritingQuestion(questionData);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      console.error("Lỗi tạo Writing:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // CẬP NHẬT – CHUẨN NHƯ SPEAKING
  async update(req, res) {
    try {
      // UPDATED FOR MULTIPLE IMAGES
      // DEBUG LOGGING
      console.log("UPDATE WRITING - Req Body:", req.body);
      console.log("UPDATE WRITING - Req Body Images (from middleware):", req.body.images);

      const { task, type, topic, question, sampleAnswer, difficulty } = req.body;

      // Uploaded new files are in req.body.images (from middleware)
      const newImages = req.body.images || [];
      
      // Existing images kept by user (sent as array of strings or single string)
      let existing = req.body.existingImages || [];
      if (typeof existing === 'string') existing = [existing];
      if (!Array.isArray(existing)) existing = [];

      const finalImages = [...existing, ...newImages];
      
      const questionData = {
        skill: "writing",
        task,
        type,
        topic,
        question,
        sampleAnswer: sampleAnswer || "",
        difficulty: difficulty || "medium",
        images: finalImages,
        image: finalImages.length > 0 ? finalImages[0] : null // Sync legacy
      };

      const updated = await WritingQuestionService.updateWritingQuestion(
        req.params.id,
        questionData
      );
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      console.error("Lỗi update Writing:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // LẤY CHI TIẾT – CHUẨN NHƯ SPEAKING
  async getById(req, res) {
    try {
      const foundQuestion = await WritingQuestionService.getWritingQuestionById(
        req.params.id
      );
      if (!foundQuestion) throw new Error("Câu hỏi không tồn tại");

      // Backward compatibility fix for view
      const data = foundQuestion.toObject ? foundQuestion.toObject() : foundQuestion;
      if (data.image && (!data.images || data.images.length === 0)) {
          data.images = [data.image];
      }
      // Ensure full URL if needed (User Service usually handles this but let's be safe)
      // Actually standardizing on stored paths being relative or absolute?
      // Mongoose doesn't transform by default. Assuming stored are relative paths '/uploads...'

      res.status(200).json({ success: true, data: data });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // LẤY DANH SÁCH (DÙNG CHO LIST + DETAIL + EDIT) – CHUẨN NHƯ SPEAKING
  async getAll(req, res) {
    try {
      const questions = await WritingQuestionService.getAllWritingQuestions();
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // XÓA – CHUẨN NHƯ SPEAKING
  async delete(req, res) {
    try {
      await WritingQuestionService.deleteWritingQuestion(req.params.id);
      res.status(200).json({ success: true, message: "Câu hỏi đã xóa" });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // PHÂN TRANG – CHUẨN NHƯ SPEAKING
  async getAllPaginated(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";

      const result = await WritingQuestionService.getPaginatedQuestions(
        page,
        limit,
        search
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

  // LẤY THEO PART (DỰ PHÒNG) – CHUẨN NHƯ SPEAKING
  async getByPart(req, res) {
    try {
      const partId = req.params.partId;
      const questions = await WritingQuestionService.getQuestionsByPart(partId);
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}

module.exports = new WritingQuestionController();
