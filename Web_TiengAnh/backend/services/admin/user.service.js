// const userRepo = require("../../repositories/auth/user.repository");

// class AdminUserService {
//   async getAllUsers() {
//     return await userRepo.getAll();
//   }

//   async getUserById(id) {
//     const user = await userRepo.findByIdWithRole(id);
//     if (!user) throw new Error("User không tồn tại");
//     return user;
//   }

//   async createUser(data) {
//     // Check trùng username/email
//     const existUsername = await userRepo.findByUsername(data.username);
//     if (existUsername) throw new Error("Username đã tồn tại");

//     const existEmail = await userRepo.findByEmail(data.email);
//     if (existEmail) throw new Error("Email đã tồn tại");

//     const user = await userRepo.create(data);
//     return user;
//   }

//   async updateUser(id, data) {
//     const user = await userRepo.update(id, data);
//     if (!user) throw new Error("Không tìm thấy user để cập nhật");
//     return user;
//   }

//   async deleteUser(id) {
//     const deleted = await userRepo.delete(id);
//     if (!deleted) throw new Error("Không tìm thấy user để xóa");
//     return deleted;
//   }
// }

// module.exports = new AdminUserService();

// services/admin/user.service.js
const userRepo = require("../../repositories/auth/user.repository");
const roleRepo = require("../../repositories/common/role.repository");
const bcrypt = require("bcryptjs");

class AdminUserService {
  async getAllUsers() {
    return await userRepo.getAllWithRole(); // ĐÃ OK
  }

  async getUserById(id) {
    const user = await userRepo.findByIdWithRole(id);
    if (!user) throw new Error("User không tồn tại");
    return user; // ĐÃ CÓ roleId.name
  }

  async createUser(data) {
    const existUsername = await userRepo.findByUsername(data.username);
    if (existUsername) throw new Error("Username đã tồn tại");

    const existEmail = await userRepo.findByEmail(data.email);
    if (existEmail) throw new Error("Email đã tồn tại");

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return await userRepo.create(data);
  }

  async updateUser(id, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = await userRepo.update(id, data);
    if (!user) throw new Error("Không tìm thấy user");
    return user;
  }

  async deleteUser(id) {
    const deleted = await userRepo.delete(id);
    if (!deleted) throw new Error("Không tìm thấy user để xóa");
    return deleted;
  }

  // SỬA LẠI HOÀN TOÀN – LẤY TỪ ROLE MODEL, KO DÙNG USER
  async getAllRoles() {
    try {
      const roles = await roleRepo.getAll();
      // ĐẢM BẢO TRẢ VỀ ĐÚNG FORMAT: [{ _id, name }]
      return roles.map((r) => ({
        _id: r._id.toString(),
        name: r.name,
      }));
    } catch (err) {
      console.error("Lỗi lấy roles:", err);
      return [];
    }
  }
}

module.exports = new AdminUserService();
