const mongoose = require("mongoose");

const WordTopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  totalCards: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Xóa tất cả word cards khi xóa topic
WordTopicSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const WordCard = require("./wordCard.model");
      await WordCard.deleteMany({ topic: this._id });
      next();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = mongoose.model("WordTopic", WordTopicSchema, "WordTopics");
