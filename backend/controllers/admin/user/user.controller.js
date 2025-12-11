// // const adminUserService = require("../../../services/admin/user.service");

// // class AdminUserController {
// //   async getAll(req, res) {
// //     try {
// //       const users = await adminUserService.getAllUsers();
// //       res.json(users);
// //     } catch (err) {
// //       res.status(500).json({ message: err.message });
// //     }
// //   }

// //   async getById(req, res) {
// //     try {
// //       const user = await adminUserService.getUserById(req.params.id);
// //       res.json(user);
// //     } catch (err) {
// //       res.status(404).json({ message: err.message });
// //     }
// //   }

// //   async create(req, res) {
// //     try {
// //       const user = await adminUserService.createUser(req.body);
// //       res.status(201).json(user);
// //     } catch (err) {
// //       res.status(400).json({ message: err.message });
// //     }
// //   }

// //   async update(req, res) {
// //     try {
// //       const user = await adminUserService.updateUser(req.params.id, req.body);
// //       res.json(user);
// //     } catch (err) {
// //       res.status(400).json({ message: err.message });
// //     }
// //   }

// //   async delete(req, res) {
// //     try {
// //       await adminUserService.deleteUser(req.params.id);
// //       res.json({ message: "Đã xóa user thành công" });
// //     } catch (err) {
// //       res.status(400).json({ message: err.message });
// //     }
// //   }
// // }

// // module.exports = new AdminUserController();

// // controllers/admin/user.controller.js
// const adminUserService = require("../../../services/admin/user.service");

// class AdminUserController {
//   async getAll(req, res) {
//     try {
//       const users = await adminUserService.getAllUsers();
//       res.json(users);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   }

//   async getById(req, res) {
//     try {
//       const user = await adminUserService.getUserById(req.params.id);
//       res.json(user);
//     } catch (err) {
//       res.status(404).json({ message: err.message });
//     }
//   }

//   async create(req, res) {
//     try {
//       const user = await adminUserService.createUser(req.body);
//       res.status(201).json(user);
//     } catch (err) {
//       res.status(400).json({ message: err.message });
//     }
//   }

//   async update(req, res) {
//     try {
//       const user = await adminUserService.updateUser(req.params.id, req.body);
//       res.json(user);
//     } catch (err) {
//       res.status(400).json({ message: err.message });
//     }
//   }

//   async delete(req, res) {
//     try {
//       await adminUserService.deleteUser(req.params.id);
//       res.json({ message: "Đã xóa user thành công" });
//     } catch (err) {
//       res.status(400).json({ message: err.message });
//     }
//   }

//   async getRoles(req, res) {
//     try {
//       const roles = await adminUserService.getAllRoles();
//       res.json(roles);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   }
// }

// module.exports = new AdminUserController();

// controllers/admin/user.controller.js
const adminUserService = require("../../../services/admin/user.service");
const Role = require("../../../models/user/role.model");

class AdminUserController {
  async getAll(req, res) {
    try {
      const users = await adminUserService.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const user = await adminUserService.getUserById(req.params.id);
      res.json(user);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  }

  async create(req, res) {
    try {
      const user = await adminUserService.createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async update(req, res) {
    try {
      const user = await adminUserService.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async delete(req, res) {
    try {
      await adminUserService.deleteUser(req.params.id);
      res.json({ message: "Đã xóa user thành công" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // ĐẢM BẢO TRẢ VỀ ARRAY LUÔN
  async getRoles(req, res) {
    try {
      const roles = await adminUserService.getAllRoles();
      res.json(roles);
    } catch (err) {
      res.status(500).json({ message: "Lỗi server" });
    }
  }
}

module.exports = new AdminUserController();
