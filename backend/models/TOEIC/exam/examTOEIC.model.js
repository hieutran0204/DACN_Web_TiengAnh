const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    examCode: {
        type: String,
        required: true,
        unique: true
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    parts: [{
        type: Number,
        enum: [5, 6, 7],
        required: true
    }],
    difficulty: {
        type: Number,
        enum: [0, 1, 2], // 0: Easy, 1: Medium, 2: Hard
        required: true
    },
    questionCount: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        enum: [0, 1, 2], // 0: Draft, 1: Published, 2: Archived
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);