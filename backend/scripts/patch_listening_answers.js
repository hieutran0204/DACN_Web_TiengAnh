const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tienganh_db";

const ListeningQuestionSchema = new mongoose.Schema({}, { strict: false });
const ListeningQuestion = mongoose.model("ListeningQuestion", ListeningQuestionSchema, "listeningquestions");

async function patchAnswers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");
    
    // Parent ID from debug log
    const parentId = "693ae24ac9b59948c0359474";
    
    const doc = await ListeningQuestion.findById(parentId);
    if (!doc) {
        console.log("Document not found!");
        process.exit(1);
    }
    
    console.log(`Found doc: ${doc.title}`);
    let modified = false;

    // Patch Q1
    const idx1 = doc.subQuestions.findIndex(sq => sq.question.includes("When will they arrive"));
    if (idx1 >= 0) {
        console.log("Patching Q1 (Arrive)...");
        doc.subQuestions[idx1].correctAnswers = ["On the 22nd of July"];
        // Also set deprecated field just in case
        doc.subQuestions[idx1].correctAnswer = "On the 22nd of July"; 
        modified = true;
    }

    // Patch Q2
    const idx2 = doc.subQuestions.findIndex(sq => sq.question.includes("price mentioned"));
    if (idx2 >= 0) {
        console.log("Patching Q2 (Price)...");
        doc.subQuestions[idx2].correctAnswers = ["It has increased to $250"];
        doc.subQuestions[idx2].correctAnswer = "It has increased to $250";
        modified = true;
    }

    if (modified) {
        doc.markModified('subQuestions');
        await doc.save();
        console.log("SUCCESS: Patched correct answers.");
    } else {
        console.log("No questions matched for patching.");
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

patchAnswers();
