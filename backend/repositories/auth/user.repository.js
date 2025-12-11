// repositories/auth/user.repository.js
const User = require("../../models/user/user.model");
const bcrypt = require("bcryptjs");

class UserRepository {
  // ĐĂNG NHẬP – PHẢI CÓ POPULATE ROLE
  async findByUsernameWithRole(username) {
    return await User.findOne({ username })
      .populate("roleId", "name")
      .select("+password") // vì password bị select: false
      .lean();
  }

  async findByUsername(username) {
    return await User.findOne({ username }).lean();
  }

  async findByEmail(email) {
    return await User.findOne({ email }).lean();
  }

  async create(data) {
    return await User.create(data);
  }

  async update(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true }).select(
      "-password"
    );
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  async getAllWithRole() {
    return await User.find()
      .populate("roleId", "name _id")
      .select("-password -__v")
      .lean();
  }

  async findByIdWithRole(id) {
    return await User.findById(id)
      .populate("roleId", "name _id")
      .select("-password -__v")
      .lean();
  }
}

module.exports = new UserRepository();
