// models/certificate.model.js
const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  MaCC: {
    type: String,
    required: true // ví dụ TOEIC
  },
  TopicN: {
    type: Number,
    required: true // đề số mấy
  },
  userName: {
    type: String,
    required: true // tên người thi
  },
  score: {
    type: Number,
    required: true // điểm
  },
  passed: {
    type: Boolean,
    default: false
  },
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

certificateSchema.index({ MaCC: 1, TopicN: 1, userName: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
