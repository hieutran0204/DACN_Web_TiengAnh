const mongoose = require("mongoose");

/**
 * Task 1.1: Raw Essay Storage
 * Stores the original student input before AI processing.
 * This serves as the Source of Truth for the GraphRAG pipeline.
 */
const RawEssaySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  question: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "WritingQuestion", 
    required: true 
  },
  exam: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Exam" 
  }, // Optional if practiced independently
  
  content: { 
    type: String, 
    required: true 
  },
  
  taskType: { 
    type: String, 
    enum: ["Task 1", "Task 2"],
    required: true
  },
  
  status: { 
    type: String, 
    enum: ["pending", "processing", "completed", "failed"], 
    default: "pending" 
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Indexing for faster lookups during AI processing
RawEssaySchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("RawEssay", RawEssaySchema);
