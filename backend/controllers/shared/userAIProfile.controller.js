const UserAIProfile = require("../models/userAIProfile.model");

await UserAIProfile.findOneAndUpdate(
  { userId: req.user._id },
  {
    $inc: { totalSessions: 1 },
    $set: {
      avgWritingScore: newAvg,
      weaknesses: newWeaknesses,
      updatedAt: new Date(),
    },
  },
  { upsert: true, new: true }
);
