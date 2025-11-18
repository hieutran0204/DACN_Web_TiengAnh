const mongoose = require("mongoose");
const categoryRepository = require("../../repositories/game/category.repository");

class CategoryService {
  isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  async createCategory(data) {
    // Check if category already exists
    const existingCategory = await categoryRepository.findByName(data.name);
    if (existingCategory) {
      throw new Error("Category already exists");
    }
    return await categoryRepository.create(data);
  }

  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async getCategoryById(id) {
    if (!this.isValidObjectId(id)) throw new Error("Invalid ID");
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error("Category not found");
    return category;
  }

  async updateCategory(id, data) {
    if (!this.isValidObjectId(id)) throw new Error("Invalid ID");
    
    // Check if name is being updated and if it already exists
    if (data.name) {
      const existingCategory = await categoryRepository.findByName(data.name);
      if (existingCategory && existingCategory._id.toString() !== id) {
        throw new Error("Category name already exists");
      }
    }
    
    const category = await categoryRepository.updateById(id, data);
    if (!category) throw new Error("Category not found");
    return category;
  }

  async deleteCategory(id) {
    if (!this.isValidObjectId(id)) throw new Error("Invalid ID");
    const category = await categoryRepository.deleteById(id);
    if (!category) throw new Error("Category not found");
    return true;
  }
}

module.exports = new CategoryService();