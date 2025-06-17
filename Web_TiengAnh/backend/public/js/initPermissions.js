const mongoose = require("mongoose");
const Calm = require("./models/user/calm.model");
const Role = require("./models/user/role.model");

async function initPermissions() {
  try {
    // Tìm roleId cho admin và user
    const adminRole = await Role.findOne({ name: "admin" });
    const userRole = await Role.findOne({ name: "user" });

    if (!adminRole || !userRole) {
      throw new Error("Không tìm thấy role admin hoặc user");
    }

    // Định nghĩa các quyền
    const permissions = [
      // Quyền cho admin
      {
        roleId: adminRole._id,
        resource: "userQuestion",
        actions: ["create", "read", "update", "delete"],
      },
      {
        roleId: adminRole._id,
        resource: "listeningQuestion",
        actions: ["create", "read", "update", "delete"],
      },
      {
        roleId: adminRole._id,
        resource: "part",
        actions: ["create", "read", "update", "delete"],
      },
      {
        roleId: adminRole._id,
        resource: "readingQuestion",
        actions: ["create", "read", "update", "delete"],
      },
      {
        roleId: adminRole._id,
        resource: "skill",
        actions: ["create", "read", "update", "delete"],
      },
      {
        roleId: adminRole._id,
        resource: "speakingQuestion",
        actions: ["create", "read", "update", "delete"],
      },
      {
        roleId: adminRole._id,
        resource: "writingTask",
        actions: ["create", "read", "update", "delete"],
      },
      {
        roleId: adminRole._id,
        resource: "exam",
        actions: ["create", "read", "update", "delete", "publish"],
      },
      { roleId: adminRole._id, resource: "submission", actions: ["read"] },
      // Quyền cho user
      { roleId: userRole._id, resource: "userQuestion", actions: ["read"] },
      {
        roleId: userRole._id,
        resource: "listeningQuestion",
        actions: ["read"],
      },
      { roleId: userRole._id, resource: "part", actions: ["read"] },
      { roleId: userRole._id, resource: "readingQuestion", actions: ["read"] },
      { roleId: userRole._id, resource: "skill", actions: ["read"] },
      { roleId: userRole._id, resource: "speakingQuestion", actions: ["read"] },
      { roleId: userRole._id, resource: "writingTask", actions: ["read"] },
      { roleId: userRole._id, resource: "exam", actions: ["read"] },
      {
        roleId: userRole._id,
        resource: "submission",
        actions: ["create", "read"],
      },
    ];

    // Xóa và thêm lại các quyền để tránh trùng lặp
    await Calm.deleteMany({});
    await Calm.insertMany(permissions);

    console.log("Khởi tạo phân quyền thành công!");
  } catch (err) {
    console.error("Lỗi khi khởi tạo phân quyền:", err.message);
  }
}

module.exports = initPermissions;
