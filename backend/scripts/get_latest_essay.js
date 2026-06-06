const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const WritingSubmission = require('../models/Submission.model'); // Since module.exports = mongoose.model("WritingSubmission", WritingSubmissionSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Find the latest writing submission
  const latest = await WritingSubmission.findOne().sort({ submittedAt: -1 }).lean();
  
  if (latest) {
    console.log("=== LATEST ESSAY SUBMITTED ===");
    console.log("ID:", latest._id);
    console.log("Date:", latest.submittedAt);
    console.log("Status:", latest.status);
    console.log("Answer:\n", latest.answer.substring(0, 500) + '...');
    
    if (latest.result) {
        console.log("------------------------");
        console.log("=== FULL LAYER 5 RESULT ===");
        console.log(JSON.stringify(latest.result, null, 2));
    } else {
        console.log("No result yet (pending/processing).");
    }
  } else {
    console.log("No writing submissions found.");
  }
  
  process.exit(0);
}

run().catch(console.error);
