const mongoose = require("mongoose");

/**
 * Decoupled Writing Submission Model
 * Represents a single submission for a single Writing Task.
 */

// Schema for detailed AI analysis results
const WritingResultSchema = new mongoose.Schema(
  {
    overall_band: { type: Number },

    band_breakdown: {
      task_response: Number,
      coherence_cohesion: Number,
      lexical_resource: Number,
      grammatical_range_accuracy: Number,
    },

    feedback_vn: String,
    evidence_based_justification_vn: Object,
    
    // Detailed Sentence-level Feedback
    annotated_text: [Object],
    detailed_errors: [Object],

    // Vocabulary & Insights
    advanced_vocabulary: [Object],
    strengths: [String],
    weaknesses: [String],
    recommendations_vn: String,
    corrected_essay: String,

    // Statistics (Feature Map)
    feature_map: Object,
    hard_caps_applied: Object,

    // Debugging (RAG)
    rag_debug_info: Object,
    math_debug: Object,

    generated_at: { type: Date, default: Date.now },
    model_source: { type: String, default: "gemini-1.5-flash" },
  },
  { _id: false }
);

const WritingSubmissionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  exam: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Exam" 
  },
  question: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "WritingQuestion", 
    required: true 
  },

  answer: { 
    type: String, 
    required: true 
  },
  
  // result can be null if AI is still processing (using status)
  result: { 
    type: WritingResultSchema 
  },

  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "completed"
  },

  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Indexing for faster history lookup
WritingSubmissionSchema.index({ user: 1, submittedAt: -1 });

module.exports = mongoose.model("WritingSubmission", WritingSubmissionSchema);
