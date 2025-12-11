const wordTopicService = require("../../../services/wordguessing/wordTopic.service");

class WordTopicAdminController {
  async create(req, res) {
    try {
      // FIX: chuẩn hóa tên field từ frontend
      const data = {
        name:
          req.body.name ||
          req.body.tenTopic ||
          req.body.title ||
          req.body.TenTopic,
        description:
          req.body.description || req.body.moTa || req.body.mota || "",
      };

      if (!data.name) {
        return res.status(400).json({
          success: false,
          message: "Tên topic là bắt buộc",
        });
      }

      const topic = await wordTopicService.createTopic(data);
      res.status(201).json({
        success: true,
        message: "Tạo topic thành công",
        data: topic,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAll(req, res) {
    try {
      const topics = await wordTopicService.getAllTopics();
      res.status(200).json({
        success: true,
        data: topics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const topic = await wordTopicService.getTopicById(req.params.id);
      res.status(200).json({
        success: true,
        data: topic,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const updated = await wordTopicService.updateTopic(
        req.params.id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: "Cập nhật thành công",
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      await wordTopicService.deleteTopic(req.params.id);
      res.status(200).json({
        success: true,
        message: "Xóa topic thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new WordTopicAdminController();
