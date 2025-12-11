// models/WritingSubmission.model.js
const mongoose = require("mongoose");

// Schema cho toàn bộ kết quả AI trả về
const WritingResultSchema = new mongoose.Schema(
  {
    overall_band: { type: Number, required: true },

    band_breakdown: {
      task_response: Number,
      coherence_cohesion: Number,
      lexical_resource: Number,
      grammatical_range_accuracy: Number,
    },

    advanced_vocabulary: [Object],
    idioms_phrasalverbs: [String],
    collocations: [String],
    academic_words: [String],
    repeated_words: [String],
    filler_words_in_writing: [String],

    grammar_errors_found: [Object],
    strengths: [String],
    weaknesses: [String],
    recommendations_vn: String,
    corrected_essay: String,

    word_count: Number,
    sentence_count: Number,
    paragraph_count: Number,
    type_token_ratio: Number,
    lexical_density: Number,

    generated_at: Date,
    model_source: { type: String, default: "gemini-2.0-flash" },
  },
  { _id: false }
);

// Schema cho mỗi task
const TaskSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: String,
  image: String,
  answer: { type: String, required: true },
  result: { type: WritingResultSchema, required: true },
});

// Schema chính
const WritingSubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },

  task1: TaskSchema,
  task2: TaskSchema,

  overallBand: { type: Number, required: true }, // (T1 + 2*T2) / 3
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WritingSubmission", WritingSubmissionSchema);
