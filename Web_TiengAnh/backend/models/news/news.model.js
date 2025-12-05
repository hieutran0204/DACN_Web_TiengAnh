const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  image: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 3;
      },
      message: 'Phải có đúng 3 đáp án'
    }
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 2
  },
  author: {
    type: String,
    default: "Admin"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("News", newsSchema);