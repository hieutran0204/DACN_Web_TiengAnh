const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Hardcode Mongo URI if .env is tricky to locate from script
// Assuming standard local mongo execution or reusing existing connection logic
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tienganh_db"; // Verify DB name

const ReadingQuestionSchema = new mongoose.Schema(
  {
    passageNumber: String,
    passage: String,
    image: String,
    subQuestions: [
      {
        type: { type: String },
        question: String,
        options: [String],
        correctAnswer: String,
        correctAnswers: [String],
        headings: [String],
        paragraphLabel: String,
        wordLimit: Number,
      },
    ],
    explanation: String,
    difficulty: String,
  },
  { timestamps: true }
);

const ReadingQuestion = mongoose.model("ReadingQuestion", ReadingQuestionSchema, "ReadingQuestions");

const fs = require('fs');
const LOG_FILE = path.join(__dirname, 'output.log');

function log(msg) {
  console.log(msg);
  fs.appendFileSync(LOG_FILE, msg + '\n');
}

async function fixSubQuestionIds() {
  try {
    fs.writeFileSync(LOG_FILE, ''); // Clear log
    log("Connecting to MongoDB... " + MONGO_URI);
    await mongoose.connect(MONGO_URI);
    log("Connected.");
    
    const targetId = "69491073f8d125e69cba5ad6";
    log("************************************************");
    try {
        const specificQ = await ReadingQuestion.findOne({ _id: targetId }).lean();
        if (specificQ) {
            log(`FOUND SPECIFIC QUESTION: ${specificQ._id}`);
            log(JSON.stringify(specificQ, null, 2));
        } else {
            log(`SPECIFIC QUESTION ${targetId} NOT FOUND IN DB!`);
            
            const someQuestions = await ReadingQuestion.find({}).limit(3).lean();
            log(`FOUND ${someQuestions.length} OTHER QUESTIONS:`);
            someQuestions.forEach(q => log(` - ID: ${q._id}`));
        }
    } catch (e) {
        log("ERROR FINDING SPECIFIC ID: " + e.message);
    }
    log("************************************************");

    // Check all questions for missing IDs
    const questions = await ReadingQuestion.find({});
    log(`FOUND ${questions.length} READING QUESTIONS (DOCUMENTS)`);
    
    let count = 0;
    for (const q of questions) {
      let modified = false;
      if (q.subQuestions && q.subQuestions.length > 0) {
        // Mongoose auto-generates IDs on load if missing in DB. 
        // We must force save to persist them.
        // We can check against lean data to be sure, or just force save all.
        // Let's force save.
        
        // Ensure they have IDs (they should in Document form)
        q.subQuestions.forEach(sq => {
             if (!sq._id) sq._id = new mongoose.Types.ObjectId();
        });

        q.markModified('subQuestions');
        await q.save();
        count++;
        log(`  => FORCED SAVE for Question ${q._id}`);
      }
    }
    log("************************************************");
    log(`FINISHED. UPDATED ${count} DOCUMENTS.`);
    process.exit(0);
  } catch (err) {
    log("Error: " + err);
    process.exit(1);
  }
}

fixSubQuestionIds();
