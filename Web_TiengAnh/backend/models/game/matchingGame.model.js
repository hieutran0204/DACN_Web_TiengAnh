const mongoose = require("mongoose");

const matchingGameSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
    index: true
  },

  // 4 từ (string thuần)
  words: [{
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  }],

  // 4 nghĩa tương ứng (index 0 nghĩa của từ index 0)
  meanings: [{
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  }],

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  }
}, {
  timestamps: true
});

// Validate: đúng 4 từ và 4 nghĩa
matchingGameSchema.pre("save", function (next) {
  if (this.words.length !== 4) {
    return next(new Error("Matching game phải có đúng 4 từ"));
  }
  if (this.meanings.length !== 4) {
    return next(new Error("Matching game phải có đúng 4 nghĩa"));
  }
  next();
});

// Index compound để query nhanh
matchingGameSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("MatchingGame", matchingGameSchema);