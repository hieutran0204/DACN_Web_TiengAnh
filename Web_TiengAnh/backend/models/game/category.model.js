const mongoose = require("mongoose");
const Word = require("./word.model");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

// Xóa tất cả words khi xóa category
categorySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    await Word.deleteMany({ category: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Category", categorySchema);