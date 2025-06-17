const Role = require("../../models/user/role.model");

// Tìm vai trò theo tên
const findByName = async (name) => {
  try {
    return await Role.findOne({ name });
  } catch (error) {
    throw new Error(`Lỗi khi tìm vai trò: ${error.message}`);
  }
};

// Tạo vai trò mới
const create = async (roleData) => {
  try {
    const role = new Role(roleData);
    return await role.save();
  } catch (error) {
    throw new Error(`Lỗi khi tạo vai trò: ${error.message}`);
  }
};

// Lấy tất cả vai trò
const findAll = async () => {
  try {
    return await Role.find();
  } catch (error) {
    throw new Error(`Lỗi khi lấy danh sách vai trò: ${error.message}`);
  }
};

// Cập nhật vai trò theo ID
const updateById = async (id, updateData) => {
  try {
    return await Role.findByIdAndUpdate(id, updateData, { new: true });
  } catch (error) {
    throw new Error(`Lỗi khi cập nhật vai trò: ${error.message}`);
  }
};

// Xóa vai trò theo ID
const deleteById = async (id) => {
  try {
    return await Role.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Lỗi khi xóa vai trò: ${error.message}`);
  }
};

module.exports = {
  findByName,
  create,
  findAll,
  updateById,
  deleteById,
};
