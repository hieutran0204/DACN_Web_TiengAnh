// // services/user/profile.service.js
// const profileRepo = require("../../repositories/user/profile.repository");
// const bcrypt = require("bcryptjs");

// class ProfileService {
//   async getProfile(userId) {
//     const user = await profileRepo.findById(userId);
//     if (!user) throw new Error("User không tồn tại");
//     return user;
//   }

//   async updateProfile(userId, data) {
//     if (data.password) {
//       data.password = await bcrypt.hash(data.password, 10);
//     }
//     const user = await profileRepo.update(userId, data);
//     if (!user) throw new Error("User không tồn tại");
//     return user;
//   }
// }

// module.exports = new ProfileService();

// services/user/profile.service.js
const profileRepo = require("../../repositories/user/profile.repository");
const bcrypt = require("bcryptjs");

class ProfileService {
  async getProfile(userId) {
    console.log("SERVICE GET PROFILE → userId:", userId); // LOG
    const user = await profileRepo.findById(userId);
    if (!user) throw new Error("User không tồn tại");
    return user;
  }

  async updateProfile(userId, data) {
    console.log("SERVICE UPDATE PROFILE → userId:", userId); // LOG
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = await profileRepo.update(userId, data);
    if (!user) throw new Error("User không tồn tại");
    return user;
  }
}

module.exports = new ProfileService();
