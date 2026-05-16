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

  // MỚI: Hỗ trợ phân trang và tìm kiếm
  async findAll({ page = 1, limit = 10, search = "" }) {
    const skip = (page - 1) * limit;
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } }, // Thêm name nếu có
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .populate("roleId", "name _id")
        .select("-password -__v")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByIdWithRole(id) {
    return await User.findById(id)
      .populate("roleId", "name _id")
      .select("-password -__v")
      .lean();
  }
}

module.exports = new UserRepository();
