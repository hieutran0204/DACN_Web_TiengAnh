// repositories/auth/user.repository.js
const User = require("../../models/user.model");
const bcrypt = require("bcryptjs");

class UserRepository {
  constructor() {
    this.model = User;
  }

  async findByUsername(username) {
    return await this.model.findOne({ username }).lean();
  }

  async findByEmail(email) {
    return await this.model.findOne({ email }).lean();
  }

  async create(data) {
    return await this.model.create(data);
  }

  async update(id, data) {
    return await this.model
      .findByIdAndUpdate(id, data, { new: true })
      .select("-password");
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  // HÀM QUAN TRỌNG – PHẢI CÓ!!!
  async getAllWithRole() {
    return await this.model
      .find()
      .populate("roleId", "name")
      .select("-password -__v")
      .lean();
  }

  async findByIdWithRole(id) {
    return await this.model
      .findById(id)
      .populate("roleId", "name")
      .select("-password -__v")
      .lean();
  }
}

// XUẤT ĐÚNG CÁCH – ĐẢM BẢO KHÔNG BỊ CACHE
module.exports = new UserRepository();
