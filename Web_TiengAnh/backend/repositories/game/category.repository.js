const Category = require("../../models/game/category.model");

class CategoryRepository {
  async create(data) {
    return await Category.create(data);
  }

  async findAll() {
    return await Category.find().sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Category.findById(id);
  }

  async findByName(name) {
    return await Category.findOne({ name: new RegExp('^' + name + '$', 'i') });
  }

  async updateById(id, data) {
    return await Category.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id) {
    return await Category.findByIdAndDelete(id);
  }
}

module.exports = new CategoryRepository();