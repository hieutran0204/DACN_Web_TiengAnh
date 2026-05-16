const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wordCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    level: { 
        type: String, 
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Intermediate" 
    },
    wordCount: { type: Number, default: 0 },
    words: [{ type: String }], 
    image: { type: String }, 
    description: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WordCategory", wordCategorySchema);
