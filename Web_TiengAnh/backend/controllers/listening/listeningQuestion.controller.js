// // // // const ListeningQuestionService = require("../../services/listening/listeningQuestion.service");
// // // // const mongoose = require("mongoose");

// // // // class ListeningQuestionController {
// // // //   async create(req, res) {
// // // //     try {
// // // //       const audioFile = req.files?.audio?.[0];
// // // //       const imageFile = req.files?.image?.[0];

// // // //       const audioUrl = audioFile
// // // //         ? `/uploads/listening/audio/${audioFile.filename}`
// // // //         : null;
// // // //       const imageUrl = imageFile
// // // //         ? `/uploads/listening/image/${imageFile.filename}`
// // // //         : null;

// // // //       const questionData = { ...req.body };
// // // //       if (
// // // //         questionData.part &&
// // // //         typeof questionData.part === "string" &&
// // // //         mongoose.Types.ObjectId.isValid(questionData.part)
// // // //       ) {
// // // //         questionData.part = new mongoose.Types.ObjectId(questionData.part);
// // // //       } else {
// // // //         throw new Error("Giá trị part không hợp lệ");
// // // //       }

// // // //       questionData.audio = audioUrl;
// // // //       questionData.image = imageUrl;

// // // //       const question =
// // // //         await ListeningQuestionService.createListeningQuestion(questionData);
// // // //       res.status(201).json({ success: true, data: question });
// // // //     } catch (error) {
// // // //       console.error("Lỗi tạo câu hỏi:", error);
// // // //       res.status(400).json({ success: false, message: error.message });
// // // //     }
// // // //   }

// // // //   async getById(req, res) {
// // // //     try {
// // // //       const question = await ListeningQuestionService.getListeningQuestionById(
// // // //         req.params.id
// // // //       );
// // // //       if (!question) throw new Error("Câu hỏi không tồn tại");

// // // //       // Populate part để lấy name
// // // //       const populatedQuestion = await question.populate("part", "name");
// // // //       res.status(200).json({ success: true, data: populatedQuestion });
// // // //     } catch (error) {
// // // //       res.status(404).json({ success: false, message: error.message });
// // // //     }
// // // //   }

// // // //   async getAll(req, res) {
// // // //     try {
// // // //       const questions =
// // // //         await ListeningQuestionService.getAllListeningQuestions();
// // // //       res.status(200).json({ success: true, data: questions });
// // // //     } catch (error) {
// // // //       res.status(500).json({ success: false, message: error.message });
// // // //     }
// // // //   }

// // // //   async update(req, res) {
// // // //     try {
// // // //       const audioFile = req.files?.audio?.[0];
// // // //       const imageFile = req.files?.image?.[0];

// // // //       const questionData = { ...req.body };

// // // //       // Chỉ chuyển đổi part thành ObjectId nếu là chuỗi hợp lệ, nếu không giữ nguyên
// // // //       if (questionData.part && typeof questionData.part === "string") {
// // // //         if (mongoose.Types.ObjectId.isValid(questionData.part)) {
// // // //           questionData.part = new mongoose.Types.ObjectId(questionData.part); // Sử dụng new
// // // //         } else {
// // // //           throw new Error("Giá trị part không hợp lệ");
// // // //         }
// // // //       } else if (questionData.part && typeof questionData.part !== "object") {
// // // //         throw new Error("Giá trị part không hợp lệ");
// // // //       }

// // // //       // Update audio/image only if new file or URL is provided
// // // //       if (audioFile) {
// // // //         questionData.audio = `/uploads/listening/audio/${audioFile.filename}`;
// // // //       } else if (req.body.audio) {
// // // //         questionData.audio = req.body.audio;
// // // //       }

// // // //       if (imageFile) {
// // // //         questionData.image = `/uploads/listening/image/${imageFile.filename}`;
// // // //       } else if (req.body.image) {
// // // //         questionData.image = req.body.image;
// // // //       }

// // // //       const question = await ListeningQuestionService.updateListeningQuestion(
// // // //         req.params.id,
// // // //         questionData
// // // //       );
// // // //       res.status(200).json({ success: true, data: question });
// // // //     } catch (error) {
// // // //       res.status(400).json({ success: false, message: error.message });
// // // //     }
// // // //   }

// // // //   async delete(req, res) {
// // // //     try {
// // // //       await ListeningQuestionService.deleteListeningQuestion(req.params.id);
// // // //       res.status(200).json({ success: true, message: "Câu hỏi đã xóa" });
// // // //     } catch (error) {
// // // //       res.status(404).json({ success: false, message: error.message });
// // // //     }
// // // //   }

// // // //   async getByPart(req, res) {
// // // //     try {
// // // //       const partId = new mongoose.Types.ObjectId(req.params.partId); // Sử dụng new
// // // //       const questions =
// // // //         await ListeningQuestionService.getQuestionsByPart(partId);
// // // //       res.status(200).json({ success: true, data: questions });
// // // //     } catch (error) {
// // // //       res.status(404).json({ success: false, message: error.message });
// // // //     }
// // // //   }
// // // //   async getAllPaginated(req, res) {
// // // //     try {
// // // //       const page = parseInt(req.query.page) || 1;
// // // //       const limit = parseInt(req.query.limit) || 10;

// // // //       const result = await ListeningQuestionService.getPaginatedQuestions(
// // // //         page,
// // // //         limit
// // // //       );

// // // //       res.status(200).json({
// // // //         success: true,
// // // //         data: result.data,
// // // //         total: result.total,
// // // //         page: result.page,
// // // //         limit: result.limit,
// // // //         totalPages: result.totalPages,
// // // //         hasNextPage: page < result.totalPages,
// // // //         hasPrevPage: page > 1,
// // // //       });
// // // //     } catch (error) {
// // // //       res.status(500).json({ success: false, message: error.message });
// // // //     }
// // // //   }
// // // // }

// // // // module.exports = new ListeningQuestionController();

// // // const ListeningQuestionService = require("../../services/listening/listeningQuestion.service");
// // // const mongoose = require("mongoose");

// // // class ListeningQuestionController {
// // //   // ✅ [POST] /api/listening
// // //   async create(req, res) {
// // //     try {
// // //       const audioFile = req.files?.audio?.[0];
// // //       const imageFile = req.files?.image?.[0];

// // //       const audioUrl = audioFile
// // //         ? `/uploads/listening/audio/${audioFile.filename}`
// // //         : null;
// // //       const imageUrl = imageFile
// // //         ? `/uploads/listening/image/${imageFile.filename}`
// // //         : null;

// // //       const questionData = { ...req.body };

// // //       // 🔹 Đổi part → section (và validate)
// // //       if (questionData.section && typeof questionData.section === "string") {
// // //         if (!mongoose.Types.ObjectId.isValid(questionData.section)) {
// // //           throw new Error("Giá trị section không hợp lệ");
// // //         }
// // //         questionData.section = new mongoose.Types.ObjectId(
// // //           questionData.section
// // //         );
// // //       } else {
// // //         throw new Error("Giá trị section không hợp lệ");
// // //       }

// // //       questionData.audio = audioUrl;
// // //       questionData.image = imageUrl;

// // //       const question =
// // //         await ListeningQuestionService.createListeningQuestion(questionData);

// // //       res.status(201).json({ success: true, data: question });
// // //     } catch (error) {
// // //       console.error("Lỗi tạo câu hỏi:", error);
// // //       res.status(400).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   // ✅ [GET] /api/listening/:id
// // //   async getById(req, res) {
// // //     try {
// // //       const question = await ListeningQuestionService.getListeningQuestionById(
// // //         req.params.id
// // //       );
// // //       if (!question) throw new Error("Câu hỏi không tồn tại");

// // //       // 🔹 Populate section thay vì part
// // //       const populatedQuestion = await question.populate("section", "name");
// // //       res.status(200).json({ success: true, data: populatedQuestion });
// // //     } catch (error) {
// // //       res.status(404).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   // ✅ [GET] /api/listening
// // //   async getAll(req, res) {
// // //     try {
// // //       const questions =
// // //         await ListeningQuestionService.getAllListeningQuestions();
// // //       res.status(200).json({ success: true, data: questions });
// // //     } catch (error) {
// // //       res.status(500).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   // ✅ [PUT] /api/listening/:id
// // //   async update(req, res) {
// // //     try {
// // //       const audioFile = req.files?.audio?.[0];
// // //       const imageFile = req.files?.image?.[0];
// // //       const questionData = { ...req.body };

// // //       // 🔹 Chuyển đổi section hợp lệ
// // //       if (questionData.section && typeof questionData.section === "string") {
// // //         if (mongoose.Types.ObjectId.isValid(questionData.section)) {
// // //           questionData.section = new mongoose.Types.ObjectId(
// // //             questionData.section
// // //           );
// // //         } else {
// // //           throw new Error("Giá trị section không hợp lệ");
// // //         }
// // //       } else if (
// // //         questionData.section &&
// // //         typeof questionData.section !== "object"
// // //       ) {
// // //         throw new Error("Giá trị section không hợp lệ");
// // //       }

// // //       // 🔹 Update audio/image nếu có
// // //       if (audioFile) {
// // //         questionData.audio = `/uploads/listening/audio/${audioFile.filename}`;
// // //       } else if (req.body.audio) {
// // //         questionData.audio = req.body.audio;
// // //       }

// // //       if (imageFile) {
// // //         questionData.image = `/uploads/listening/image/${imageFile.filename}`;
// // //       } else if (req.body.image) {
// // //         questionData.image = req.body.image;
// // //       }

// // //       const question = await ListeningQuestionService.updateListeningQuestion(
// // //         req.params.id,
// // //         questionData
// // //       );

// // //       res.status(200).json({ success: true, data: question });
// // //     } catch (error) {
// // //       res.status(400).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   // ✅ [DELETE] /api/listening/:id
// // //   async delete(req, res) {
// // //     try {
// // //       await ListeningQuestionService.deleteListeningQuestion(req.params.id);
// // //       res.status(200).json({ success: true, message: "Câu hỏi đã được xóa" });
// // //     } catch (error) {
// // //       res.status(404).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   // ✅ [GET] /api/listening/section/:sectionId
// // //   async getBySection(req, res) {
// // //     try {
// // //       const sectionId = new mongoose.Types.ObjectId(req.params.sectionId);
// // //       const questions =
// // //         await ListeningQuestionService.getQuestionsBySection(sectionId);
// // //       res.status(200).json({ success: true, data: questions });
// // //     } catch (error) {
// // //       res.status(404).json({ success: false, message: error.message });
// // //     }
// // //   }

// // //   // ✅ [GET] /api/listening/paginated?page=1&limit=10
// // //   async getAllPaginated(req, res) {
// // //     try {
// // //       const page = parseInt(req.query.page) || 1;
// // //       const limit = parseInt(req.query.limit) || 10;

// // //       const result = await ListeningQuestionService.getPaginatedQuestions(
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

// // // module.exports = new ListeningQuestionController();

// // // backend/controllers/listening/listeningQuestion.controller.js

// // const ListeningQuestionService = require("../../services/listening/listeningQuestion.service");

// // class ListeningQuestionController {
// //   // [POST] /api/admin/questions/listening/listening-questions
// //   async create(req, res) {
// //     try {
// //       // Chỉ dùng single file upload cho audio (hoặc multer.fields nếu cần image)
// //       const audioFile = req.file; // multer single('audio') hoặc req.files.audio?.[0]
// //       const audioUrl = audioFile
// //         ? `/uploads/listening/audio/${audioFile.filename}`
// //         : null;

// //       const {
// //         title,
// //         section, // "Section 1", "Section 2", "Section 3", "Section 4"
// //         type,
// //         transcript,
// //         explanation,
// //         subQuestions,
// //       } = req.body;

// //       // KHÔNG CẦN ÉP ObjectId NỮA!
// //       // section là String → để nguyên → Mongoose tự validate enum

// //       const questionData = {
// //         title,
// //         section, // ← Đúng kiểu String
// //         type,
// //         audio: audioUrl,
// //         transcript: transcript || "",
// //         explanation: explanation || "",
// //         subQuestions:
// //           typeof subQuestions === "string"
// //             ? JSON.parse(subQuestions)
// //             : subQuestions,
// //       };

// //       const question =
// //         await ListeningQuestionService.createListeningQuestion(questionData);

// //       res.status(201).json({
// //         success: true,
// //         message: "Tạo câu hỏi Listening thành công!",
// //         data: question,
// //       });
// //     } catch (error) {
// //       console.error("Lỗi tạo câu hỏi Listening:", error);
// //       res.status(400).json({
// //         success: false,
// //         message: error.message.includes("enum")
// //           ? "Section phải là: Section 1, Section 2, Section 3 hoặc Section 4"
// //           : error.message || "Tạo câu hỏi thất bại",
// //       });
// //     }
// //   }

// //   // [GET] /:id
// //   async getById(req, res) {
// //     try {
// //       const question = await ListeningQuestionService.getListeningQuestionById(
// //         req.params.id
// //       );
// //       if (!question) throw new Error("Không tìm thấy câu hỏi");

// //       res.status(200).json({ success: true, data: question });
// //     } catch (error) {
// //       res.status(404).json({ success: false, message: error.message });
// //     }
// //   }

// //   // [GET] /
// //   async getAll(req, res) {
// //     try {
// //       const questions =
// //         await ListeningQuestionService.getAllListeningQuestions();
// //       res.status(200).json({ success: true, data: questions });
// //     } catch (error) {
// //       res.status(500).json({ success: false, message: error.message });
// //     }
// //   }

// //   // [PUT] /:id
// //   async update(req, res) {
// //     try {
// //       const audioFile = req.file;
// //       const audioUrl = audioFile
// //         ? `/uploads/listening/audio/${audioFile.filename}`
// //         : undefined;

// //       const {
// //         title,
// //         section, // String: "Section 1"...
// //         type,
// //         transcript,
// //         explanation,
// //         subQuestions,
// //       } = req.body;

// //       const updateData = {
// //         title,
// //         section, // ← để nguyên String
// //         type,
// //         transcript,
// //         explanation,
// //         subQuestions:
// //           typeof subQuestions === "string"
// //             ? JSON.parse(subQuestions)
// //             : subQuestions,
// //       };

// //       if (audioUrl) updateData.audio = audioUrl;

// //       const question = await ListeningQuestionService.updateListeningQuestion(
// //         req.params.id,
// //         updateData
// //       );

// //       res
// //         .status(200)
// //         .json({
// //           success: true,
// //           message: "Cập nhật thành công",
// //           data: question,
// //         });
// //     } catch (error) {
// //       console.error("Lỗi cập nhật:", error);
// //       res.status(400).json({
// //         success: false,
// //         message: error.message.includes("enum")
// //           ? "Section phải là: Section 1, Section 2, Section 3 hoặc Section 4"
// //           : error.message || "Cập nhật thất bại",
// //       });
// //     }
// //   }

// //   // [DELETE] /:id
// //   async delete(req, res) {
// //     try {
// //       await ListeningQuestionService.deleteListeningQuestion(req.params.id);
// //       res
// //         .status(200)
// //         .json({ success: true, message: "Xóa câu hỏi thành công" });
// //     } catch (error) {
// //       res.status(404).json({ success: false, message: error.message });
// //     }
// //   }

// //   // [GET] /paginated?page=1&limit=10
// //   async getAllPaginated(req, res) {
// //     try {
// //       const page = parseInt(req.query.page) || 1;
// //       const limit = parseInt(req.query.limit) || 10;

// //       const result = await ListeningQuestionService.getPaginatedQuestions(
// //         page,
// //         limit
// //       );

// //       res.status(200).json({
// //         success: true,
// //         data: result.data,
// //         total: result.total,
// //         totalPages: result.totalPages,
// //         page: result.page,
// //         limit: result.limit,
// //         hasNextPage: page < result.totalPages,
// //         hasPrevPage: page > 1,
// //       });
// //     } catch (error) {
// //       res.status(500).json({ success: false, message: error.message });
// //     }
// //   }
// // }

// // module.exports = new ListeningQuestionController();

// const ListeningQuestionService = require("../../services/listening/listeningQuestion.service");

// class ListeningQuestionController {
//   // CREATE
//   async create(req, res) {
//     try {
//       // Middleware đã tự gán req.body.audio và req.body.image nếu có file mới
//       if (!req.body.audio) {
//         throw new Error("Vui lòng upload file audio!");
//       }

//       const { title, section, type, transcript, explanation, subQuestions } =
//         req.body;

//       const questionData = {
//         title,
//         section,
//         type,
//         audio: req.body.audio, // ← ĐÃ CÓ SẴN TỪ MIDDLEWARE
//         image: req.body.image || null, // ← Có thể null
//         transcript: transcript || "",
//         explanation: explanation || "",
//         subQuestions:
//           typeof subQuestions === "string"
//             ? JSON.parse(subQuestions)
//             : subQuestions,
//       };

//       const question =
//         await ListeningQuestionService.createListeningQuestion(questionData);

//       res.status(201).json({
//         success: true,
//         message: "Tạo câu hỏi Listening thành công!",
//         data: question,
//       });
//     } catch (error) {
//       console.error("Lỗi tạo:", error);
//       res.status(400).json({
//         success: false,
//         message: error.message.includes("enum")
//           ? "Section phải là: Section 1, Section 2, Section 3 hoặc Section 4"
//           : error.message,
//       });
//     }
//   }

//   // UPDATE
//   async update(req, res) {
//     try {
//       const { title, section, type, transcript, explanation, subQuestions } =
//         req.body;

//       const updateData = {
//         title,
//         section,
//         type,
//         transcript: transcript || "",
//         explanation: explanation || "",
//         subQuestions:
//           typeof subQuestions === "string"
//             ? JSON.parse(subQuestions)
//             : subQuestions,
//       };

//       // Chỉ cập nhật nếu middleware đã gán (có file mới hoặc giữ URL cũ)
//       if (req.body.audio) updateData.audio = req.body.audio;
//       if (req.body.image !== undefined) updateData.image = req.body.image;

//       const question = await ListeningQuestionService.updateListeningQuestion(
//         req.params.id,
//         updateData
//       );

//       res.json({
//         success: true,
//         message: "Cập nhật thành công",
//         data: question,
//       });
//     } catch (error) {
//       res.status(400).json({ success: false, message: error.message });
//     }
//   }

//   // Các hàm khác giữ nguyên
//   async getById(req, res) {
//     try {
//       const question = await ListeningQuestionService.getListeningQuestionById(
//         req.params.id
//       );
//       if (!question) throw new Error("Không tìm thấy");
//       res.json({ success: true, data: question });
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
//       res.json({
//         success: true,
//         data: result.data,
//         total: result.total,
//         totalPages: result.totalPages || Math.ceil(result.total / limit),
//         page,
//         limit,
//       });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   }

//   async delete(req, res) {
//     try {
//       await ListeningQuestionService.deleteListeningQuestion(req.params.id);
//       res.json({ success: true, message: "Xóa thành công" });
//     } catch (error) {
//       res.status(404).json({ success: false, message: error.message });
//     }
//   }
// }

// module.exports = new ListeningQuestionController();

const ListeningQuestionService = require("../../services/listening/listeningQuestion.service");

class ListeningQuestionController {
  // =========================
  // 🔥 CREATE LISTENING QUESTION
  // =========================
  async create(req, res) {
    try {
      if (!req.body.audio) {
        throw new Error("Vui lòng upload file audio!");
      }

      const { title, section, type, transcript, explanation } = req.body;

      // Parse subQuestions từ FE gửi lên
      let subQuestions =
        typeof req.body.subQuestions === "string"
          ? JSON.parse(req.body.subQuestions)
          : req.body.subQuestions;

      // ==========================
      // 🔥 CHUẨN HÓA SUBQUESTION
      // ==========================
      subQuestions = subQuestions.map((sq) => {
        // MULTIPLE CHOICE
        if (type === "multiple_choice") {
          return {
            question: sq.question,
            options: sq.options,
            correctAnswer: sq.correctAnswer,
          };
        }

        // FILL / NOTE / SENTENCE — mảng nhiều đáp án
        if (
          [
            "fill_in_the_blank",
            "note_completion",
            "sentence_completion",
          ].includes(type)
        ) {
          return {
            question: sq.question,
            correctAnswers: sq.correctAnswers || [],
          };
        }

        // MATCHING
        if (type === "matching") {
          return {
            question: sq.question,
            correctAnswer: sq.correctAnswer,
            matchingOptions: sq.matchingOptions || [],
          };
        }

        return sq;
      });

      const questionData = {
        title,
        section,
        type,
        audio: req.body.audio,
        image: req.body.image || null,
        transcript: transcript || "",
        explanation: explanation || "",
        subQuestions,
      };

      const question =
        await ListeningQuestionService.createListeningQuestion(questionData);

      res.status(201).json({
        success: true,
        message: "Tạo câu hỏi Listening thành công!",
        data: question,
      });
    } catch (error) {
      console.error("Lỗi tạo:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // =========================
  // 🔥 UPDATE LISTENING QUESTION
  // =========================
  async update(req, res) {
    try {
      const { title, section, type, transcript, explanation } = req.body;

      // Parse subQuestions
      let subQuestions =
        typeof req.body.subQuestions === "string"
          ? JSON.parse(req.body.subQuestions)
          : req.body.subQuestions;

      // Chuẩn hóa y hệt phần create
      subQuestions = subQuestions.map((sq) => {
        if (type === "multiple_choice") {
          return {
            question: sq.question,
            options: sq.options,
            correctAnswer: sq.correctAnswer,
          };
        }

        if (
          [
            "fill_in_the_blank",
            "note_completion",
            "sentence_completion",
          ].includes(type)
        ) {
          return {
            question: sq.question,
            correctAnswers: sq.correctAnswers || [],
          };
        }

        if (type === "matching") {
          return {
            question: sq.question,
            correctAnswer: sq.correctAnswer,
            matchingOptions: sq.matchingOptions || [],
          };
        }

        return sq;
      });

      const updateData = {
        title,
        section,
        type,
        transcript: transcript || "",
        explanation: explanation || "",
        subQuestions,
      };

      if (req.body.audio) updateData.audio = req.body.audio;
      if (req.body.image !== undefined) updateData.image = req.body.image;

      const question = await ListeningQuestionService.updateListeningQuestion(
        req.params.id,
        updateData
      );

      res.json({
        success: true,
        message: "Cập nhật thành công",
        data: question,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // =========================
  // 🔥 GET BY ID
  // =========================
  // =========================
  // GET BY ID – PHIÊN BẢN HOÀN HẢO, CHẠY NGON 100% CHO TRANG EDIT
  // =========================
  async getById(req, res) {
    try {
      const question = await ListeningQuestionService.getListeningQuestionById(
        req.params.id
      );
      if (!question) throw new Error("Không tìm thấy câu hỏi");

      // =========================
      // CHUẨN HÓA DỮ LIỆU TRƯỚC KHI GỬI CHO FRONTEND
      // =========================
      const normalized = question.toObject();

      // 1. Đảm bảo audio là full URL
      if (normalized.audio) {
        normalized.audio = `${req.protocol}://${req.get("host")}${normalized.audio}`;
      }

      // 2. Chuẩn hóa subQuestions về đúng format frontend đang mong đợi
      if (normalized.subQuestions && normalized.subQuestions.length > 0) {
        normalized.subQuestions = normalized.subQuestions.map((sq) => {
          // Trường hợp multiple_choice: chuyển correctAnswer → correctAnswers[0]
          if (
            normalized.type === "multiple_choice" &&
            sq.correctAnswer !== undefined
          ) {
            return {
              question: sq.question || "",
              options: sq.options || ["", "", "", ""],
              correctAnswers: [sq.correctAnswer], // ← chuyển thành array
            };
          }

          // Trường hợp fill/note/sentence: đảm bảo correctAnswers là array
          if (
            [
              "fill_in_the_blank",
              "note_completion",
              "sentence_completion",
            ].includes(normalized.type)
          ) {
            return {
              question: sq.question || "",
              correctAnswers: Array.isArray(sq.correctAnswers)
                ? sq.correctAnswers
                : sq.correctAnswers
                  ? [sq.correctAnswers]
                  : [],
            };
          }

          // Trường hợp matching
          if (normalized.type === "matching") {
            return {
              question: sq.question || "",
              correctAnswers: sq.correctAnswer ? [sq.correctAnswer] : [],
              matchingOptions: normalized.matchingOptions || [],
            };
          }

          return sq;
        });
      }

      // Nếu là matching thì gán matchingOptions ra ngoài
      if (normalized.type === "matching" && normalized.matchingOptions) {
        normalized.matchingOptions = normalized.matchingOptions;
      }

      res.json({ success: true, data: normalized });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // =========================
  // 🔥 GET PAGINATED
  // =========================
  async getAllPaginated(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await ListeningQuestionService.getPaginatedQuestions(
        page,
        limit
      );

      res.json({
        success: true,
        data: result.data,
        total: result.total,
        totalPages: result.totalPages,
        page,
        limit,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // =========================
  // 🔥 DELETE
  // =========================
  async delete(req, res) {
    try {
      await ListeningQuestionService.deleteListeningQuestion(req.params.id);
      res.json({ success: true, message: "Xóa thành công" });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ListeningQuestionController();
