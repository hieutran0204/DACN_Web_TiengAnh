const calmRepo = require("./calm.repository");

module.exports = (resource, action) => {
  return async (req, res, next) => {
    try {
      const roleId = req.user.roleId;

      if (!roleId) {
        return res
          .status(401)
          .json({ message: "Không được phép: Thiếu vai trò" });
      }

      const actions = await calmRepo.getPermissionsByRoleAndResource(
        roleId,
        resource
      );

      if (!actions.includes(action)) {
        return res.status(403).json({ message: "Cấm: Không được phép" });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        message: "Kiểm tra quyền không thành công",
        error: err.message,
      });
    }
  };
};
