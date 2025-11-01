const mongoose = require("mongoose");

const userAIProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  learningLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  },
  avgWritingScore: { type: Number, default: 0 },
  avgSpeakingScore: { type: Number, default: 0 },
  avgListeningScore: { type: Number, default: 0 },
  avgReadingScore: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  weaknesses: [{ type: String }],
  goal: {
    type: String,
    enum: ["IELTS", "TOEIC", "General"],
    default: "General",
  },
  dailyGoalMinutes: { type: Number, default: 15 },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserAIProfile", userAIProfileSchema);
