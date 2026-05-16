const mongoose = require("mongoose");
const path = require("path");
const fs = require('fs');

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tienganh_db";
const LOG_FILE = path.join(__dirname, 'output_listening.log');

function log(msg) {
  console.log(msg);
  fs.appendFileSync(LOG_FILE, msg + '\n');
}

const ListeningQuestionSchema = new mongoose.Schema({
  section: { type: String, enum: ["Section 1", "Section 2", "Section 3", "Section 4"] },
  type: { type: String },
  title: String,
  audio: String,
  subQuestions: [
    {
      question: String,
      correctAnswer: String,
      correctAnswers: [String],
      options: [String],
      matchingOptions: [String],
    },
  ],
});

const ListeningQuestion = mongoose.model("ListeningQuestion", ListeningQuestionSchema, "listeningquestions");

async function fixListeningSubQuestionIds() {
  try {
    fs.writeFileSync(LOG_FILE, '');
    log("Connecting to MongoDB... " + MONGO_URI);
    await mongoose.connect(MONGO_URI);
    log("Connected.");

    const collections = await mongoose.connection.db.listCollections().toArray();
    log("COLLECTIONS IN DB: " + JSON.stringify(collections.map(c => c.name)));

    // Check lean first
    const questionsLean = await ListeningQuestion.find({}).lean();
    log(`FOUND ${questionsLean.length} LISTENING QUESTIONS (LEAN)`);
    
    // Debug sample
    if (questionsLean.length > 0 && questionsLean[0].subQuestions && questionsLean[0].subQuestions.length > 0) {
        log("SAMPLE LISTENING SUBQUESTION (LEAN): " + JSON.stringify(questionsLean[0].subQuestions[0]));
    }

    const questions = await ListeningQuestion.find({});
    log(`FOUND ${questions.length} LISTENING QUESTIONS (DOCUMENTS)`);

    let count = 0;
    for (const q of questions) {
      let modified = false;
      if (q.subQuestions && q.subQuestions.length > 0) {
        q.subQuestions.forEach((sq, idx) => {
          if (!sq._id) {
             sq._id = new mongoose.Types.ObjectId();
             // log(`Generated ID for Q ${q._id} SubQ ${idx}`);
          }
        });
        
        // Force save to persist IDs
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

fixListeningSubQuestionIds();
