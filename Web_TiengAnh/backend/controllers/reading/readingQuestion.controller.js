// // // const ReadingQuestionService = require("../../services/reading/readingQuestion.service");
// // // const mongoose = require("mongoose");

// // // // Thêm BASE_URL từ biến môi trường
// // // const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// // // class ReadingQuestionController {
// // //   async create(req, res) {
// // //     try {
// // //       const imageFile = req.files?.image?.[0];
// // //       // Sửa URL hình ảnh để bao gồm BASE_URL
// // //       const imageUrl = imageFile
// // //         ? `${BASE_URL}/uploads/reading/image/${imageFile.filename}`
// // //         : null;

// // //       const questionData = { ...req.body };
// // //       if (
// // //         questionData.part &&
// // //         typeof questionData.part === "string" &&
// // //         mongoose.Types.ObjectId.isValid(questionData.part)
// // //       ) {
// // //         questionData.part = new mongoose.Types.ObjectId(questionData.part);
// // //       } else {
// // //         throw new Error("Giá trị part không hợp lệ");
// // //       }

// // //       questionData.image = imageUrl;

// // //       const question =
// // //         await ReadingQuestionService.createReadingQuestion(questionData);
// // //       res.status(201).json({ success: true, data: question });
// // //     } catch (error) {
// // //       console.error("Lỗi tạo câu hỏi:", error);
// // //       res.status(400).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   async update(req, res) {
// // //     try {
// // //       const imageFile = req.files?.image?.[0];
// // //       const questionData = { ...req.body };

// // //       if (
// // //         questionData.part &&
// // //         typeof questionData.part === "string" &&
// // //         mongoose.Types.ObjectId.isValid(questionData.part)
// // //       ) {
// // //         questionData.part = new mongoose.Types.ObjectId(questionData.part);
// // //       } else if (questionData.part && typeof questionData.part !== "object") {
// // //         throw new Error("Giá trị part không hợp lệ");
// // //       }

// // //       if (imageFile) {
// // //         // Sửa URL hình ảnh để bao gồm BASE_URL
// // //         questionData.image = `${BASE_URL}/uploads/reading/image/${imageFile.filename}`;
// // //       } else if (req.body.image) {
// // //         // Nếu image là URL tương đối, thêm BASE_URL; nếu là tuyệt đối, giữ nguyên
// // //         questionData.image = req.body.image.startsWith("/")
// // //           ? `${BASE_URL}${req.body.image}`
// // //           : req.body.image;
// // //       }

// // //       const question = await ReadingQuestionService.updateReadingQuestion(
// // //         req.params.id,
// // //         questionData
// // //       );
// // //       res.status(200).json({ success: true, data: question });
// // //     } catch (error) {
// // //       res.status(400).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   async getById(req, res) {
// // //     try {
// // //       const question = await ReadingQuestionService.getReadingQuestionById(
// // //         req.params.id
// // //       );
// // //       if (!question) throw new Error("Câu hỏi không tồn tại");

// // //       const populatedQuestion = await question.populate("part", "name");
// // //       res.status(200).json({ success: true, data: populatedQuestion });
// // //     } catch (error) {
// // //       res.status(404).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   async getAll(req, res) {
// // //     try {
// // //       const questions = await ReadingQuestionService.getAllReadingQuestions();
// // //       res.status(200).json({ success: true, data: questions });
// // //     } catch (error) {
// // //       res.status(500).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   async delete(req, res) {
// // //     try {
// // //       await ReadingQuestionService.deleteReadingQuestion(req.params.id);
// // //       res.status(200).json({ success: true, message: "Câu hỏi đã xóa" });
// // //     } catch (error) {
// // //       res.status(404).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   async getByPart(req, res) {
// // //     try {
// // //       const partId = new mongoose.Types.ObjectId(req.params.partId);
// // //       const questions = await ReadingQuestionService.getQuestionsByPart(partId);
// // //       res.status(200).json({ success: true, data: questions });
// // //     } catch (error) {
// // //       res.status(404).json({ success: false, message: error.message });
// // //     }
// // //   }
// // //   async getAllPaginated(req, res) {
// // //     try {
// // //       const page = parseInt(req.query.page) || 1;
// // //       const limit = parseInt(req.query.limit) || 10;

// // //       const result = await ReadingQuestionService.getPaginatedQuestions(
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

// // // module.exports = new ReadingQuestionController();

// // const ReadingQuestionService = require("../../services/reading/readingQuestion.service");
// // const mongoose = require("mongoose");

// // const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// // class ReadingQuestionController {
// //   // ===== CREATE =====
// //   async create(req, res) {
// //     try {
// //       const imageFile = req.files?.image?.[0];
// //       const imageUrl = imageFile
// //         ? `${BASE_URL}/uploads/reading/image/${imageFile.filename}`
// //         : null;

// //       const questionData = { ...req.body };

// //       // ⚙️ Không còn part (ObjectId) mà là passage (string)
// //       if (!questionData.passage || typeof questionData.passage !== "string") {
// //         throw new Error("Giá trị passage không hợp lệ hoặc bị thiếu");
// //       }

// //       questionData.image = imageUrl;

// //       const passage =
// //         await ReadingQuestionService.createReadingPassage(questionData);

// //       res.status(201).json({ success: true, data: passage });
// //     } catch (error) {
// //       console.error("Lỗi tạo passage:", error);
// //       res.status(400).json({ success: false, message: error.message });
// //     }
// //   }

// //   // ===== UPDATE =====
// //   async update(req, res) {
// //     try {
// //       const imageFile = req.files?.image?.[0];
// //       const passageData = { ...req.body };

// //       if (!passageData.passage || typeof passageData.passage !== "string") {
// //         throw new Error("Giá trị passage không hợp lệ hoặc bị thiếu");
// //       }

// //       if (imageFile) {
// //         passageData.image = `${BASE_URL}/uploads/reading/image/${imageFile.filename}`;
// //       } else if (req.body.image) {
// //         passageData.image = req.body.image.startsWith("/")
// //           ? `${BASE_URL}${req.body.image}`
// //           : req.body.image;
// //       }

// //       const passage = await ReadingQuestionService.updateReadingPassage(
// //         req.params.id,
// //         passageData
// //       );

// //       res.status(200).json({ success: true, data: passage });
// //     } catch (error) {
// //       console.error("Lỗi cập nhật passage:", error);
// //       res.status(400).json({ success: false, message: error.message });
// //     }
// //   }

// //   // ===== GET BY ID =====
// //   async getById(req, res) {
// //     try {
// //       const passage = await ReadingQuestionService.getReadingPassageById(
// //         req.params.id
// //       );
// //       if (!passage) throw new Error("Passage không tồn tại");

// //       res.status(200).json({ success: true, data: passage });
// //     } catch (error) {
// //       res.status(404).json({ success: false, message: error.message });
// //     }
// //   }

// //   // ===== GET ALL =====
// //   async getAll(req, res) {
// //     try {
// //       const passages = await ReadingQuestionService.getAllReadingPassages();
// //       res.status(200).json({ success: true, data: passages });
// //     } catch (error) {
// //       res.status(500).json({ success: false, message: error.message });
// //     }
// //   }

// //   // ===== DELETE =====
// //   async delete(req, res) {
// //     try {
// //       await ReadingQuestionService.deleteReadingPassage(req.params.id);
// //       res.status(200).json({ success: true, message: "Passage đã được xóa" });
// //     } catch (error) {
// //       res.status(404).json({ success: false, message: error.message });
// //     }
// //   }

// //   // ===== PAGINATION =====
// //   async getAllPaginated(req, res) {
// //     try {
// //       const page = parseInt(req.query.page) || 1;
// //       const limit = parseInt(req.query.limit) || 10;

// //       const result = await ReadingQuestionService.getPaginatedPassages(
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
// // }

// // module.exports = new ReadingQuestionController();

// // backend/controllers/reading/readingQuestion.controller.js
// const ReadingQuestionService = require("../../services/reading/readingQuestion.service");
// const mongoose = require("mongoose");

// const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// class ReadingQuestionController {
//   // async create(req, res) {
//   //   try {
//   //     const imageFile = req.files?.image?.[0];
//   //     const imageUrl = imageFile
//   //       ? `${BASE_URL}/uploads/reading/image/${imageFile.filename}`
//   //       : null;

//   //     const {
//   //       passageNumber,
//   //       type,
//   //       passage,
//   //       difficulty = "medium",
//   //       explanation,
//   //       subQuestions: rawSubQuestions,
//   //     } = req.body;

//   //     // Validate bắt buộc
//   //     if (
//   //       !passageNumber ||
//   //       !["Passage 1", "Passage 2", "Passage 3"].includes(passageNumber)
//   //     ) {
//   //       throw new Error(
//   //         "passageNumber phải là Passage 1, Passage 2 hoặc Passage 3"
//   //       );
//   //     }
//   //     if (!type) throw new Error("Thiếu loại câu hỏi");
//   //     if (!passage || !passage.trim()) throw new Error("Passage là bắt buộc!");

//   //     // Parse subQuestions
//   //     let subQuestions = [];
//   //     if (rawSubQuestions) {
//   //       subQuestions =
//   //         typeof rawSubQuestions === "string"
//   //           ? JSON.parse(rawSubQuestions)
//   //           : rawSubQuestions;
//   //     }

//   //     if (!Array.isArray(subQuestions) || subQuestions.length === 0) {
//   //       throw new Error("Phải có ít nhất 1 câu hỏi con");
//   //     }

//   //     const questionData = {
//   //       passageNumber,
//   //       type,
//   //       passage,
//   //       difficulty,
//   //       explanation: explanation || "",
//   //       image: imageUrl,
//   //       subQuestions,
//   //     };

//   //     const question =
//   //       await ReadingQuestionService.createReadingQuestion(questionData);

//   //     res.status(201).json({
//   //       success: true,
//   //       message: "Tạo câu hỏi Reading thành công!",
//   //       data: question,
//   //     });
//   //   } catch (error) {
//   //     console.error("Lỗi tạo câu hỏi Reading:", error);
//   //     res.status(400).json({ success: false, message: error.message });
//   //   }
//   // }
//   async create(req, res) {
//     try {
//       // LOG ĐỂ CHECK – BỎ SAU KHI XONG
//       console.log("req.file:", req.file);
//       console.log("req.files:", req.files);

//       // SỬA DÒNG NÀY – HOẠT ĐỘNG VỚI MỌI MULTER!!!
//       const imageFile =
//         req.file || (req.files && (req.files.image || req.files["image"])?.[0]);

//       const imageUrl = imageFile
//         ? `/uploads/reading/image/${imageFile.filename}` // ← CHỈ LƯU ĐƯỜNG DẪN TƯƠNG ĐỐI!!!
//         : null;

//       console.log("IMAGE FILE:", imageFile);
//       console.log("IMAGE URL SẼ LƯU:", imageUrl);

//       const {
//         passageNumber,
//         type,
//         passage,
//         difficulty = "medium",
//         explanation,
//         subQuestions: rawSubQuestions,
//       } = req.body;

//       // ... validate như cũ ...

//       let subQuestions = [];
//       if (rawSubQuestions) {
//         subQuestions =
//           typeof rawSubQuestions === "string"
//             ? JSON.parse(rawSubQuestions)
//             : rawSubQuestions;
//       }

//       const questionData = {
//         passageNumber,
//         type,
//         passage,
//         difficulty,
//         explanation: explanation || "",
//         subQuestions,
//         image: imageUrl, // → BÂY GIỜ LÀ ĐÚNG!!!
//       };

//       console.log("DỮ LIỆU LƯU VÀO DB:", questionData); // ← CHECK DÒNG NÀY!!!

//       const question =
//         await ReadingQuestionService.createReadingQuestion(questionData);

//       res.status(201).json({
//         success: true,
//         message: "Tạo passage thành công!",
//         data: question,
//       });
//     } catch (error) {
//       console.error("Lỗi tạo passage:", error);
//       res.status(400).json({ success: false, message: error.message });
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

//       res.json({
//         success: true,
//         data: result.data,
//         pagination: {
//           total: result.total,
//           page,
//           limit,
//           totalPages: Math.ceil(result.total / limit),
//         },
//       });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   }

//   // async getById(req, res) {
//   //   try {
//   //     const question = await ReadingQuestionService.getReadingQuestionById(
//   //       req.params.id
//   //     );
//   //     res.json({ success: true, data: question });
//   //   } catch (error) {
//   //     res.status(404).json({ success: false, message: error.message });
//   //   }
//   // }

//   // controllers/reading/readingQuestion.controller.js

//   async getById(req, res) {
//     try {
//       const question = await ReadingQuestionService.getReadingQuestionById(
//         req.params.id
//       );

//       // ÉP TRẢ VỀ IMAGE DÙ SAO ĐI NỮA
//       const responseData = {
//         ...(question._doc || question),
//         image: question.image || null,
//       };

//       res.json({ success: true, data: responseData });
//     } catch (error) {
//       res.status(404).json({ success: false, message: error.message });
//     }
//   }
//   async update(req, res) {
//     try {
//       const imageFile = req.files?.image?.[0];
//       const imageUrl = imageFile
//         ? `${BASE_URL}/uploads/reading/image/${imageFile.filename}`
//         : undefined;

//       const updateData = { ...req.body };
//       if (imageUrl) updateData.image = imageUrl;

//       if (
//         updateData.subQuestions &&
//         typeof updateData.subQuestions === "string"
//       ) {
//         updateData.subQuestions = JSON.parse(updateData.subQuestions);
//       }

//       const question = await ReadingQuestionService.updateReadingQuestion(
//         req.params.id,
//         updateData
//       );
//       res.json({ success: true, data: question });
//     } catch (error) {
//       res.status(400).json({ success: false, message: error.message });
//     }
//   }

//   async delete(req, res) {
//     try {
//       await ReadingQuestionService.deleteReadingQuestion(req.params.id);
//       res.json({ success: true, message: "Xóa thành công" });
//     } catch (error) {
//       res.status(404).json({ success: false, message: error.message });
//     }
//   }
// }

// module.exports = new ReadingQuestionController();

const ReadingQuestionService = require("../../services/reading/readingQuestion.service");

class ReadingQuestionController {
  // ==================== CREATE ====================
  async create(req, res) {
    try {
      // Xử lý ảnh
      const imageFile = req.file || req.files?.image?.[0];
      const imageUrl = imageFile
        ? `/uploads/reading/image/${imageFile.filename}`
        : null;

      const {
        passageNumber,
        passage,
        difficulty = "medium",
        explanation = "",
        subQuestions: rawSubQuestions,
      } = req.body;

      // Validate passageNumber
      if (
        !passageNumber ||
        !["Passage 1", "Passage 2", "Passage 3"].includes(passageNumber)
      ) {
        return res.status(400).json({
          success: false,
          message: "passageNumber phải là Passage 1, Passage 2 hoặc Passage 3",
        });
      }

      // Validate passage
      if (!passage || !passage.trim()) {
        return res.status(400).json({
          success: false,
          message: "Passage là bắt buộc!",
        });
      }

      // Parse subQuestions
      let subQuestions = [];
      if (rawSubQuestions) {
        try {
          subQuestions =
            typeof rawSubQuestions === "string"
              ? JSON.parse(rawSubQuestions)
              : rawSubQuestions;
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: "subQuestions không đúng định dạng JSON",
          });
        }
      }

      if (!Array.isArray(subQuestions) || subQuestions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Phải có ít nhất 1 câu hỏi con!",
        });
      }

      // Validate mỗi subQuestion có type và question
      for (let i = 0; i < subQuestions.length; i++) {
        const sq = subQuestions[i];
        if (!sq.type) {
          return res.status(400).json({
            success: false,
            message: `Câu hỏi thứ ${i + 1} thiếu trường 'type'`,
          });
        }
        if (!sq.question || !sq.question.trim()) {
          return res.status(400).json({
            success: false,
            message: `Câu hỏi thứ ${i + 1} thiếu nội dung câu hỏi`,
          });
        }
      }

      const data = {
        passageNumber,
        passage: passage.trim(),
        difficulty,
        explanation: explanation.trim() || undefined,
        image: imageUrl,
        subQuestions,
      };

      const result = await ReadingQuestionService.createReadingQuestion(data);

      return res.status(201).json({
        success: true,
        message: "Tạo passage Reading thành công!",
        data: result,
      });
    } catch (error) {
      console.error("Lỗi tạo passage:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Lỗi server",
      });
    }
  }

  // ==================== GET PAGINATED ====================
  async getAllPaginated(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10));

      const result = await ReadingQuestionService.getPaginatedQuestions(
        page,
        limit
      );

      return res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách:", error);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  }

  // ==================== GET BY ID ====================
  async getById(req, res) {
    try {
      const question = await ReadingQuestionService.getReadingQuestionById(
        req.params.id
      );
      const response = {
        ...question.toObject(),
        image: question.image || null,
      };
      return res.json({ success: true, data: response });
    } catch (error) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  // ==================== UPDATE ====================
  async update(req, res) {
    try {
      const imageFile = req.file || req.files?.image?.[0];
      const imageUrl = imageFile
        ? `/uploads/reading/image/${imageFile.filename}`
        : undefined;

      const updateData = { ...req.body };
      if (imageUrl) updateData.image = imageUrl;
      if (req.body.removeImage === "true") updateData.image = null;

      if (
        updateData.subQuestions &&
        typeof updateData.subQuestions === "string"
      ) {
        try {
          updateData.subQuestions = JSON.parse(updateData.subQuestions);
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: "subQuestions không đúng định dạng JSON",
          });
        }
      }

      const result = await ReadingQuestionService.updateReadingQuestion(
        req.params.id,
        updateData
      );

      return res.json({
        success: true,
        message: "Cập nhật passage thành công!",
        data: result,
      });
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      return res
        .status(400)
        .json({ success: false, message: error.message || "Lỗi server" });
    }
  }

  // ==================== DELETE ====================
  async delete(req, res) {
    try {
      await ReadingQuestionService.deleteReadingQuestion(req.params.id);
      return res.json({ success: true, message: "Xóa passage thành công!" });
    } catch (error) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ReadingQuestionController();
