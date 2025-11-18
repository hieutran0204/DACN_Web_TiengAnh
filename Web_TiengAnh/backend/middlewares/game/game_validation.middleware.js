// const mongoose = require("mongoose");

// const validateCategory = (req, res, next) => {
//   const { name, description } = req.body;
  
//   if (!name || name.trim() === '') {
//     return res.status(400).json({ message: "Tên category là bắt buộc" });
//   }
  
//   if (name.length < 2 || name.length > 50) {
//     return res.status(400).json({ message: "Tên category phải từ 2-50 ký tự" });
//   }
  
//   next();
// };

// const validateWord = (req, res, next) => {
//   const { word, category, hint, meaning, usage, example } = req.body;
  
//   const errors = [];
  
//   if (!word || word.trim() === '') errors.push("Từ vựng là bắt buộc");
//   if (!category || !mongoose.Types.ObjectId.isValid(category)) errors.push("Category không hợp lệ");
//   if (!hint || hint.trim() === '') errors.push("Gợi ý là bắt buộc");
//   if (!meaning || meaning.trim() === '') errors.push("Nghĩa là bắt buộc");
//   if (!usage || usage.trim() === '') errors.push("Cách dùng là bắt buộc");
//   if (!example || example.trim() === '') errors.push("Ví dụ là bắt buộc");
  
//   if (errors.length > 0) {
//     return res.status(400).json({ message: errors.join(", ") });
//   }
  
//   next();
// };

// const validateObjectId = (req, res, next) => {
//   const { id } = req.params;
  
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ message: "ID không hợp lệ" });
//   }
  
//   next();
// };

// module.exports = {
//   validateCategory,
//   validateWord, 
//   validateObjectId
// };
const mongoose = require("mongoose");

const validateCategory = (req, res, next) => {
  const { name, description } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: "Tên category là bắt buộc" });
  }
  
  if (name.length < 2 || name.length > 50) {
    return res.status(400).json({ success: false, message: "Tên category phải từ 2-50 ký tự" });
  }
  
  next();
};

const validateWord = (req, res, next) => {
  const { word, category, hint, meaning, usage, example } = req.body;
  
  const errors = [];
  
  if (!word || word.trim() === '') errors.push("Từ vựng là bắt buộc");
  if (!Array.isArray(category) || category.length === 0) errors.push("Category không hợp lệ (phải là mảng ít nhất 1 ID)");
  else {
    category.forEach(id => {
      if (!mongoose.Types.ObjectId.isValid(id)) errors.push(`Category ID không hợp lệ: ${id}`);
    });
  }
  if (!hint || hint.trim() === '') errors.push("Gợi ý là bắt buộc");
  if (!meaning || meaning.trim() === '') errors.push("Nghĩa là bắt buộc");
  if (!usage || usage.trim() === '') errors.push("Cách dùng là bắt buộc");
  if (!example || example.trim() === '') errors.push("Ví dụ là bắt buộc");
  
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(", ") });
  }
  
  next();
};

const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "ID không hợp lệ" });
  }
  
  next();
};

module.exports = {
  validateCategory,
  validateWord, 
  validateObjectId
};