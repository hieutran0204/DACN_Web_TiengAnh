const Calm = require("../../models/user/calm.model");

exports.getPermissionsByRoleAndResource = async (roleId, resource) => {
  const calm = await Calm.findOne({ roleId, resource }).lean();
  return calm?.actions || [];
};
