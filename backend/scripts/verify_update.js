
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env
dotenv.config({ path: path.join(__dirname, "../.env") });

// Models
const ListeningQuestion = require("../models/listeningQuestion.model");
const service = require("../services/listening/listeningQuestion.service");

async function run() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");
    
    // 1. Create a dummy test question directly via Service (simulating 'create' controller)
    const testData = {
        title: "TEST_VERIFY_UPDATE_" + Date.now(),
        section: "Section 1",
        type: "multiple_choice",
        audio: "/uploads/test.mp3",
        subQuestions: [
            {
                question: "Question 1",
                options: ["A", "B", "C"],
                correctAnswer: "A", // Old style
                correctAnswers: ["A"] // New style might send this
            }
        ]
    };
    
    const createdQ = await service.createListeningQuestion(testData);
    console.log(`Created Question ID: ${createdQ._id}`);
    console.log(`Initial Correct Answer: ${createdQ.subQuestions[0].correctAnswer}`);
    
    // 2. Simulate Update Payload from Frontend (which sends correctAnswers array)
    // The Controller Logic we added handles the mapping before calling service.
    // So we need to mock what the controller does: receiving req.body and transforming it.
    
    // Simulating Controller Transformation
    const reqBody = {
        subQuestions: [
            {
                question: "Question 1 Updated",
                options: ["A", "B", "C"],
                // Frontend might sends NO correctAnswer, but sends correctAnswers
                correctAnswers: ["B"] 
            }
        ],
        type: "multiple_choice"
    };

    // Apply Controller Logic MANUALLY (since we can't easily call controller method without req/res)
    const subQuestions = reqBody.subQuestions.map((sq) => {
        if (reqBody.type === "multiple_choice") {
          let finalCorrectAnswer = sq.correctAnswer;
          if (Array.isArray(sq.correctAnswers) && sq.correctAnswers.length > 0) {
             finalCorrectAnswer = sq.correctAnswers[0];
          }

          return {
            question: sq.question,
            options: sq.options,
            correctAnswer: finalCorrectAnswer,
            correctAnswers: sq.correctAnswers 
          };
        }
        return sq;
    });

    const updateData = {
        title: createdQ.title,
        section: createdQ.section,
        type: reqBody.type,
        subQuestions: subQuestions
    };
    
    console.log("\nSimulated Update Data to Service:", JSON.stringify(updateData, null, 2));

    // 3. Perform Update via Service
    const updatedQ = await service.updateListeningQuestion(createdQ._id, updateData);
    
    // 4. Verify
    console.log(`\nUpdated Question ID: ${updatedQ._id}`);
    const sq = updatedQ.subQuestions[0];
    console.log(`Updated Question Text: ${sq.question}`);
    console.log(`Updated Correct Answer (DB): ${sq.correctAnswer}`);
    
    if (sq.correctAnswer === "B") {
        console.log("SUCCESS: Correct Answer was updated to B!");
    } else {
        console.error("FAILURE: Correct Answer is NOT B.");
    }

    // Cleanup
    await ListeningQuestion.findByIdAndDelete(createdQ._id);
    console.log("Cleanup done.");
    
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
