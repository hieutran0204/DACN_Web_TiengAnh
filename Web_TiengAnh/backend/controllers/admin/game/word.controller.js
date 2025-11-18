// const wordService = require("../../../services/game/word.service");

// class WordAdminController {
//   async create(req, res) {
//     try {
//       const word = await wordService.createWord(req.body);
//       res.status(201).json({ message: "Tạo từ thành công", data: word });
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   }

//   async getAll(req, res) {
//     try {
//       const words = await wordService.getAllWords();
//       res.status(200).json({ data: words });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }

//   async getById(req, res) {
//     try {
//       const word = await wordService.getWordById(req.params.id);
//       res.status(200).json({ data: word });
//     } catch (error) {
//       res.status(404).json({ message: error.message });
//     }
//   }

//   async getByCategory(req, res) {
//     try {
//       const words = await wordService.getWordsByCategory(req.params.categoryId);
//       res.status(200).json({ data: words });
//     } catch (error) {
//       res.status(404).json({ message: error.message });
//     }
//   }

//   async update(req, res) {
//     try {
//       const updated = await wordService.updateWord(req.params.id, req.body);
//       res.status(200).json({ message: "Cập nhật thành công", data: updated });
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   }

//   async delete(req, res) {
//     try {
//       await wordService.deleteWord(req.params.id);
//       res.status(200).json({ message: "Xóa từ thành công" });
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   }
// }

// module.exports = new WordAdminController();
const wordService = require("../../../services/game/word.service");

class WordAdminController {
  async create(req, res) {
    try {
      const word = await wordService.createWord(req.body);
      res.status(201).json({ success: true, message: "Tạo từ thành công", data: word });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const words = await wordService.getAllWords();
      res.status(200).json({ success: true, data: words });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const word = await wordService.getWordById(req.params.id);
      res.status(200).json({ success: true, data: word });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getByCategory(req, res) {
    try {
      const words = await wordService.getWordsByCategory(req.params.categoryId);
      res.status(200).json({ success: true, data: words });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await wordService.updateWord(req.params.id, req.body);
      res.status(200).json({ success: true, message: "Cập nhật thành công", data: updated });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await wordService.deleteWord(req.params.id);
      res.status(200).json({ success: true, message: "Xóa từ thành công" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new WordAdminController();