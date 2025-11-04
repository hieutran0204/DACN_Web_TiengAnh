// // const structuredService = require("../../services/question/structured.service");

// // class StructuredQuestionController {
// //   async getStructuredQuestions(req, res) {
// //     try {
// //       const data = await structuredService.getStructuredQuestions();
// //       res.status(200).json({ success: true, data });
// //     } catch (err) {
// //       res.status(500).json({ success: false, message: err.message });
// //     }
// //   }

// //   async getAllPaginated(req, res) {
// //     try {
// //       const page = parseInt(req.query.page) || 1;
// //       const limit = parseInt(req.query.limit) || 10;
// //       const skill = req.query.skill || "listening";

// //       const result = await structuredService.getPaginatedQuestions(
// //         skill,
// //         page,
// //         limit
// //       );

// //       res.status(200).json({
// //         success: true,
// //         data: result.data,
// //         total: result.total,
// //         page,
// //         limit,
// //         totalPages: Math.ceil(result.total / limit),
// //         hasNextPage: page < Math.ceil(result.total / limit),
// //         hasPrevPage: page > 1,
// //       });
// //     } catch (err) {
// //       res.status(500).json({ success: false, message: err.message });
// //     }
// //   }
// // }

// // module.exports = new StructuredQuestionController();
// const structuredService = require("../../services/question/structured.service");

// class StructuredQuestionController {
//   async getStructuredQuestions(req, res) {
//     try {
//       const data = await structuredService.getStructuredQuestions();
//       res.status(200).json({ success: true, data });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   async getAllPaginated(req, res) {
//     try {
//       const page = parseInt(req.query.page) || 1;
//       const limit = parseInt(req.query.limit) || 10;
//       const skill = req.query.skill || "listening";

//       const result = await structuredService.getPaginatedQuestions(
//         skill,
//         page,
//         limit
//       );

//       res.status(200).json({
//         success: true,
//         data: result.data,
//         total: result.total,
//         page,
//         limit,
//         totalPages: Math.ceil(result.total / limit),
//         hasNextPage: page < Math.ceil(result.total / limit),
//         hasPrevPage: page > 1,
//       });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   async getQuestionById(req, res) {
//     try {
//       const { id } = req.params; // Lấy id từ URL
//       const question = await structuredService.getQuestionById(id);
//       if (!question) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Câu hỏi không tìm thấy" });
//       }
//       res.status(200).json({ success: true, data: question });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }
// }

// module.exports = new StructuredQuestionController();
const structuredService = require("../../services/question/structured.service");

class StructuredQuestionController {
  async getStructuredQuestions(req, res) {
    try {
      const data = await structuredService.getStructuredQuestions();
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getAllPaginated(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skill = req.query.skill || "listening";

      const result = await structuredService.getPaginatedQuestions(
        skill,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
        hasNextPage: page < Math.ceil(result.total / limit),
        hasPrevPage: page > 1,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getQuestionById(req, res) {
    try {
      const { id } = req.params; // Lấy id từ URL
      const question = await structuredService.getQuestionById(id);
      if (!question) {
        return res
          .status(404)
          .json({ success: false, message: "Câu hỏi không tìm thấy" });
      }
      res.status(200).json({ success: true, data: question });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new StructuredQuestionController();
