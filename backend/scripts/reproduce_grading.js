
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env
dotenv.config({ path: path.join(__dirname, "../.env") });

// Models
const ListeningQuestion = require("../models/listeningQuestion.model");
const Exam = require("../models/exam.model");
// Require others if needed...
require("../models/readingQuestion.model"); 
require("../models/writingQuestion.model");
require("../models/speakingQuestion.model");

async function run() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");

    // Find an exam with listening questions
    const exam = await Exam.findOne({ "skills.listening.0": { $exists: true } }).lean();
    if (!exam) {
      console.log("No exam with listening questions found.");
      return;
    }

    console.log(`Found Exam: ${exam.title} (${exam._id})`);

    // Get the questions
    const skillIds = exam.skills.listening;
    console.log(`Listening Question IDs (Raw):`, JSON.stringify(exam.skills.listening));
    
    // Check if any ListeningQuestion exists at all
    const cnt = await ListeningQuestion.countDocuments();
    console.log(`Total ListeningQuestions in DB: ${cnt}`);
    
    if (cnt > 0) {
        const sample = await ListeningQuestion.findOne();
        console.log(`Sample ListeningQuestion ID: ${sample._id}`);
    }

    // Fetch Questions
    const questions = await ListeningQuestion.find({ _id: { $in: skillIds } }).lean();
    console.log(`Fetched ${questions.length} questions matching IDs.`);

    if (questions.length === 0) return;

    // Pick one subquestion to test
    const q = questions[0];
    const sq = q.subQuestions ? q.subQuestions[0] : null;

    if (!sq) {
        console.log("Question has no subquestions.");
        return;
    }

    console.log("\n--- TEST CASE ---");
    console.log("SubQuestion ID:", sq._id);
    console.log("SubQuestion Question:", sq.question);
    console.log("SubQuestion Options:", sq.options);
    console.log("Correct Answer (String):", sq.correctAnswer);
    console.log("Correct Answers (Array):", sq.correctAnswers);

    // DETERMINE EXPECTED ANSWER
    let validAnswers = [];
    if (Array.isArray(sq.correctAnswers) && sq.correctAnswers.length > 0) {
        validAnswers = sq.correctAnswers;
    } else if (sq.correctAnswer) {
        validAnswers = [sq.correctAnswer];
    }
    console.log("Valid Answers for Logic:", validAnswers);

    // CONSTRUCT MOCK USER ANSWER
    // Scenario 1: User sends the TEXT of the correct option (if Multiple Choice)
    let mockUserAnswer = "";
    
    // If multiple choice, we need to know what the correct KEY implies.
    // Assuming 'A' implies index 0.
    if (q.type === 'multiple_choice' && sq.options && sq.options.length > 0) {
         // If correct answer is "A", user sends text of option 0.
         // If correct answer is "Cat", user sends "Cat".
         
         // Let's try both.
         // 1. Try sending the Raw Correct Answer (e.g. "A" or "Cat")
         mockUserAnswer = validAnswers[0] || (sq.options ? sq.options[0] : "test");
         console.log(`[Test 1] User sends exact valid answer: "${mockUserAnswer}"`);
         testGrading(sq, mockUserAnswer);

         // 2. If it looks like a Key (A/B/C), try sending Option Text corresponding to it.
         if (mockUserAnswer.length === 1 && /[a-d]/i.test(mockUserAnswer)) {
             const idx = mockUserAnswer.toLowerCase().charCodeAt(0) - 97;
             if (sq.options[idx]) {
                 const textAnswer = sq.options[idx];
                 console.log(`[Test 2] User sends Option Text for Key ${mockUserAnswer}: "${textAnswer}"`);
                 testGrading(sq, textAnswer);
             }
         }
         
         // 3. Try sending key directly (A)
         console.log(`[Test 3] User sends Key directly: "A"`);
         testGrading(sq, "A");
    } else {
        // Fill in blank
         mockUserAnswer = validAnswers[0] || "test";
         console.log(`[Test 1] User sends: "${mockUserAnswer}"`);
         testGrading(sq, mockUserAnswer);
    }
    
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

function testGrading(sq, userAnswer) {
    let isCorrect = false;
    let score = 0;

    let validAnswers = [];
    if (Array.isArray(sq.correctAnswers) && sq.correctAnswers.length > 0) {
      validAnswers = sq.correctAnswers;
    } else if (sq.correctAnswer) {
      validAnswers = [sq.correctAnswer];
    }

    const normalizedCorrectAnswers = validAnswers.map((a) =>
      (a !== null && a !== undefined) ? a.toString().trim().toLowerCase() : ""
    ).filter(a => a !== "");

    let normalizedUserAnswer = userAnswer.toString().trim().toLowerCase();

    // LOGIC FROM CONTROLLER
    if (sq.options && Array.isArray(sq.options)) {
         const lowerOptions = sq.options.map(o => (o !== null && o !== undefined) ? o.toString().trim().toLowerCase() : "");
         const optionIndex = lowerOptions.findIndex(o => o === normalizedUserAnswer);
         
         if (optionIndex !== -1) {
            const key = String.fromCharCode(97 + optionIndex); 
            console.log(`   -> Mapped "${normalizedUserAnswer}" to Key "${key}"`);
            if (normalizedCorrectAnswers.includes(key)) {
                isCorrect = true;
                console.log("   -> Match via Key Mapping!");
            }
         }
    }

    if (!isCorrect && normalizedCorrectAnswers.includes(normalizedUserAnswer)) {
        isCorrect = true;
        console.log("   -> Match via Exact Match!");
    } else if (!isCorrect) {
        // Loose Match
        for (const ca of normalizedCorrectAnswers) {
            if (
            normalizedUserAnswer.startsWith(ca + ".") ||
            normalizedUserAnswer.startsWith(ca + " ") ||
            ca.startsWith(normalizedUserAnswer + ".") ||
            ca.startsWith(normalizedUserAnswer + " ")
            ) {
            isCorrect = true;
            console.log("   -> Match via Loose Match!");
            break;
            }
        }
    }

    if (isCorrect) score++;
    console.log(`   RESULT: isCorrect=${isCorrect}, Score=${score}`);
}

run();
