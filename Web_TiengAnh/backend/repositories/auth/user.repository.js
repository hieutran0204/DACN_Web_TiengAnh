const User = require("../../models/user/user.model");

// Tìm user theo username
exports.findByUsername = async (username) => {
  try {
    return await User.findOne({ username });
  } catch (err) {
    console.error("Error in findByUsername:", err.message);
    throw err; // Ném lỗi lên để xử lý ở cấp cao hơn
  }
};

// Tìm user theo username, có populate role
exports.findByUsernameWithRole = async (username) => {
  try {
    console.log("Repository - Finding username:", username); // Debug
    const user = await User.findOne({ username }).populate("roleId");
    console.log("Repository - Found user:", user); // Debug
    return user;
  } catch (err) {
    console.error("Error in findByUsernameWithRole:", err.message);
    throw err;
  }
};

// Tìm user theo email
exports.findByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (err) {
    console.error("Error in findByEmail:", err.message);
    throw err;
  }
};

// Tìm user theo email, có populate role
exports.findByEmailWithRole = async (email) => {
  try {
    return await User.findOne({ email }).populate("roleId");
  } catch (err) {
    console.error("Error in findByEmailWithRole:", err.message);
    throw err;
  }
};

// Tìm user theo id, có populate role
exports.findByIdWithRole = async (id) => {
  try {
    return await User.findById(id).populate("roleId");
  } catch (err) {
    console.error("Error in findByIdWithRole:", err.message);
    throw err;
  }
};

// Tạo user mới (dùng cho register)
exports.create = async (userData) => {
  try {
    const user = new User(userData);
    return await user.save();
  } catch (err) {
    console.error("Error in create:", err.message);
    throw err;
  }
};

// Lấy tất cả users
exports.getAll = async () => {
  try {
    return await User.find().populate("roleId");
  } catch (err) {
    console.error("Error in getAll:", err.message);
    throw err;
  }
};

// Cập nhật trạng thái
exports.updateStatus = async (id, status) => {
  try {
    return await User.findByIdAndUpdate(id, { status }, { new: true });
  } catch (err) {
    console.error("Error in updateStatus:", err.message);
    throw err;
  }
};
