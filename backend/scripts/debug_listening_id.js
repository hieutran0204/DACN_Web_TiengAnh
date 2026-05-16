const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tienganh_db";
const ListeningQuestionSchema = new mongoose.Schema({}, { strict: false });

const fs = require('fs');
const LOG_FILE = path.join(__dirname, 'debug_output.log');

function log(msg) {
  console.log(msg);
  fs.appendFileSync(LOG_FILE, msg + '\n');
}

async function checkId() {
  try {
    fs.writeFileSync(LOG_FILE, '');
    await mongoose.connect(MONGO_URI);
    log("Connected.");
    
    // The ID from the screenshot
    const targetId = "69496ce32e100e6aee6f4657"; 
    
    // Check collection 'listeningquestions'
    const LQ_lower = mongoose.model("LQ_lower", ListeningQuestionSchema, "listeningquestions");
    const docLower = await LQ_lower.findOne({ "subQuestions._id": new mongoose.Types.ObjectId(targetId) }).lean();
    
    if (docLower) {
        log("FOUND in 'listeningquestions' (Parent Document):");
        log(JSON.stringify(docLower, null, 2));
    } else {
        log("NOT FOUND in 'listeningquestions'");
    }

    process.exit(0);
  } catch (err) {
    log(err);
    process.exit(1);
  }
}

checkId();
