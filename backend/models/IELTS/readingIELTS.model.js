const mongoose = require('mongoose');

const readingIELTSSchema = new mongoose.Schema({
  MaCC: {
    type: String,
    required: true
  },
  TopicN: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: false // Có thể không có ảnh
  }
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('QuestionIELTS', readingIELTSSchema,"Reading_IELTS");
