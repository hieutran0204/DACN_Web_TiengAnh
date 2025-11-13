// // controllers/user/profile.controller.js
// const profileService = require("../../services/user/profile.service");

// class ProfileController {
//   async getMyProfile(req, res) {
//     try {
//       const user = await profileService.getProfile(req.user.id);
//       res.json(user);
//     } catch (err) {
//       res.status(404).json({ message: err.message });
//     }
//   }

//   async updateMyProfile(req, res) {
//     try {
//       const user = await profileService.updateProfile(req.user.id, req.body);
//       res.json(user);
//     } catch (err) {
//       res.status(400).json({ message: err.message });
//     }
//   }
// }

// module.exports = new ProfileController();
// controllers/user/profile.controller.js
const profileService = require("../../services/user/profile.service");

class ProfileController {
  async getMyProfile(req, res) {
    try {
      // ĐÚNG VỚI AUTH CỦA MÀY: DÙNG _id CHỨ KHÔNG PHẢI id
      const userId = req.user._id;

      console.log("GET PROFILE → userId:", userId); // LOG ĐỂ MÀY THẤY

      if (!userId) {
        return res.status(401).json({ message: "Không xác định được user" });
      }

      const user = await profileService.getProfile(userId);
      res.json(user);
    } catch (err) {
      console.error("LỖI GET PROFILE:", err.message);
      res.status(404).json({ message: err.message });
    }
  }

  async updateMyProfile(req, res) {
    try {
      const userId = req.user._id; // DÙNG _id
      const user = await profileService.updateProfile(userId, req.body);
      res.json(user);
    } catch (err) {
      console.error("LỖI UPDATE PROFILE:", err.message);
      res.status(400).json({ message: err.message });
    }
  }
}

module.exports = new ProfileController();
