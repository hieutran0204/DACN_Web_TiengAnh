const categoryService = require("../../../services/game/category.service");

class CategoryAdminController {
  async create(req, res) {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json({ success: true, message: "Tạo category thành công", data: category });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    console.log("Called getAll categories"); // Debug
    try {
      const categories = await categoryService.getAllCategories();
      res.status(200).json({ 
        success: true,
        data: categories 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  async getById(req, res) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await categoryService.updateCategory(req.params.id, req.body);
      res.status(200).json({ success: true, message: "Cập nhật thành công", data: updated });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await categoryService.deleteCategory(req.params.id);
      res.status(200).json({ success: true, message: "Xóa category thành công" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CategoryAdminController();