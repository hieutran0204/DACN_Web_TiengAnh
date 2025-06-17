// const userRepo = require("../../repositories/auth/user.repository");
// const roleRepo = require("../../repositories/auth/role.repository");
// const bcrypt = require("bcryptjs"); // Đảm bảo dùng bcryptjs
// const jwt = require("jsonwebtoken");

// class AuthService {
//   constructor() {
//     this.userRepo = userRepo;
//     this.roleRepo = roleRepo;
//   }

//   async register({ username, email, password, name }) {
//     if (!username || !email || !password || !name) {
//       throw new Error("Username, email, mật khẩu và tên không được để trống");
//     }
//     const usernameExists = await this.userRepo.findByUsername(username);
//     if (usernameExists) throw new Error("Username đã tồn tại");
//     const emailExists = await this.userRepo.findByEmail(email);
//     if (emailExists) throw new Error("Email đã tồn tại");
//     let role = await this.roleRepo.findByName("user");
//     if (!role) {
//       role = await this.roleRepo.create({
//         name: "user",
//         description: "Người dùng thông thường",
//       });
//     }
//     const hashed = await bcrypt.hash(password, 10);
//     return await this.userRepo.create({
//       username,
//       email,
//       password: hashed,
//       name,
//       roleId: role._id,
//     });
//   }

//   async login({ username, password }) {
//     console.log("Login Service - Username:", username, "Password:", password);
//     if (!username || !password) {
//       throw new Error("Username và mật khẩu không được để trống");
//     }
//     try {
//       const user = await this.userRepo.findByUsernameWithRole(username);
//       if (!user) {
//         throw new Error("Sai username hoặc mật khẩu");
//       }
//       const isPasswordValid = await bcrypt.compare(password, user.password);
//       if (!isPasswordValid) {
//         throw new Error("Sai username hoặc mật khẩu");
//       }
//       if (!user.roleId || !user.roleId._id || !user.roleId.name) {
//         throw new Error("Vai trò không hợp lệ hoặc dữ liệu vai trò bị thiếu");
//       }
//       const token = jwt.sign(
//         {
//           _id: user._id,
//           roleId: user.roleId._id,
//           role: user.roleId.name,
//           email: user.email,
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: "2h" }
//       );
//       return { token };
//     } catch (err) {
//       throw err;
//     }
//   }
// }

// module.exports = new AuthService();
const userRepo = require("../../repositories/auth/user.repository");
const roleRepo = require("../../repositories/auth/role.repository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mảng lưu trữ token hợp lệ (chỉ để demo, nên dùng Redis trong production)
const validTokens = new Set();

class AuthService {
  constructor() {
    this.userRepo = userRepo;
    this.roleRepo = roleRepo;
  }

  async register({ username, email, password, name }) {
    if (!username || !email || !password || !name) {
      throw new Error("Username, email, mật khẩu và tên không được để trống");
    }
    const usernameExists = await this.userRepo.findByUsername(username);
    if (usernameExists) throw new Error("Username đã tồn tại");
    const emailExists = await this.userRepo.findByEmail(email);
    if (emailExists) throw new Error("Email đã tồn tại");
    let role = await this.roleRepo.findByName("user");
    if (!role) {
      role = await this.roleRepo.create({
        name: "user",
        description: "Người dùng thông thường",
      });
    }
    const hashed = await bcrypt.hash(password, 10);
    return await this.userRepo.create({
      username,
      email,
      password: hashed,
      name,
      roleId: role._id,
    });
  }

  async login({ username, password }) {
    console.log("Login Service - Username:", username, "Password:", password);
    if (!username || !password) {
      throw new Error("Username và mật khẩu không được để trống");
    }
    try {
      const user = await this.userRepo.findByUsernameWithRole(username);
      if (!user) {
        throw new Error("Sai username hoặc mật khẩu");
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Sai username hoặc mật khẩu");
      }
      if (!user.roleId || !user.roleId._id || !user.roleId.name) {
        throw new Error("Vai trò không hợp lệ hoặc dữ liệu vai trò bị thiếu");
      }
      const token = jwt.sign(
        {
          _id: user._id,
          roleId: user.roleId._id,
          role: user.roleId.name,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );
      // Lưu token vào danh sách hợp lệ
      validTokens.add(token);
      return { token };
    } catch (err) {
      throw err;
    }
  }

  async logout(token) {
    // Xóa token khỏi danh sách hợp lệ
    validTokens.delete(token);
    return { message: "Đăng xuất thành công" };
  }

  // Hàm kiểm tra token có hợp lệ không
  isTokenValid(token) {
    return validTokens.has(token);
  }

  // Hàm xóa tất cả token khi server dừng
  clearAllTokens() {
    validTokens.clear();
  }
}

module.exports = new AuthService();
