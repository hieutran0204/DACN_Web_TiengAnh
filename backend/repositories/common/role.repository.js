// repositories/common/role.repository.js
const Role = require("../../models/user/role.model");

class RoleRepository {
  async getAll() {
    return await Role.find().select("_id name").lean();
  }
}

module.exports = new RoleRepository();
