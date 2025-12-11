// repositories/user/profile.repository.js
const User = require("../../models/user/user.model");

class ProfileRepository {
  async findById(userId) {
    return await User.findById(userId).populate("roleId").select("-password");
  }

  async update(userId, data) {
    return await User.findByIdAndUpdate(userId, data, { new: true })
      .populate("roleId")
      .select("-password");
  }
}

module.exports = new ProfileRepository();
