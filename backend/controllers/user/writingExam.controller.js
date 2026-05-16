
const UserExamResult = require("../../models/UserExamResult.model");
const Exam = require("../../models/exam.model");
const axios = require("axios");

// Microservice URL (assuming running on port 5000)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5000/api/ai";
const SERVICE_API_KEY = process.env.SERVICE_API_KEY || "your-secret-app-key-123";

class WritingExamController {
  
  // Submit Writing Exam (Task 1 + Task 2)
  async submitExam(req, res) {
    try {
      const userId = req.userId; // From auth middleware
      const { examId, task1, task2 } = req.body;

      if (!examId) {
        return res.status(400).json({ success: false, message: "Missing examId" });
      }

      // 1. Validate Exam existence
      const exam = await Exam.findById(examId);
      if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

      // 2. Call AI Microservice for Grading
      // Payload structure matching the new /score/writing/exam endpoint
      const aiPayload = {
        task1: task1 ? { essay: task1.answer, question: task1.question, type: task1.type } : null,
        task2: task2 ? { essay: task2.answer, question: task2.question, type: task2.type } : null,
        studentId: userId,
        examId: examId
      };

      console.log(`[Backend] Calling AI Service for User ${userId}...`);
      
      let aiResult = {};
      try {
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/score/writing/exam`, aiPayload, {
            headers: { 'x-api-key': SERVICE_API_KEY }
        });
        aiResult = aiResponse.data.data; // { task1: {...}, task2: {...} }
        console.log("[Backend] AI Result Received:", JSON.stringify(aiResult, null, 2));
      } catch (error) {
        console.error("[Backend] AI Service Failed:", error.message);
        // Fallback: Continue saving submission but without scores? Or fail?
        // User wants "Smooth", so maybe fail gracefully or return error to let them retry.
        return res.status(502).json({ 
            success: false, 
            message: "AI Grading Service Unavailable. Please try again later.",
            details: error.response?.data || error.message
        });
      }

      // 3. Calculate Scores (Simple Average for now, or take from AI)
      // Assuming AI returns overall_band
      const score1 = aiResult.task1?.overall_band || 0;
      const score2 = aiResult.task2?.overall_band || 0;
      // Writing usually averages Task 1 (1/3) and Task 2 (2/3) but simplified here:
      const finalScore = (score1 + score2 * 2) / 3; // Rough IELTS weighting

      // 4. Save UserExamResult
      // Need to structure answers array to match UserExamResult schema
      const answersToSave = [];
      if (task1) {
          answersToSave.push({
              questionId: task1.id, // Frontend must send question ID
              userAnswer: task1.answer,
              isCorrect: true, // Writing doesn't have binary correct/wrong
              correctAnswer: JSON.stringify(aiResult.task1), // Store full AI feedback here? Or just comment?
              // The schema has "correctAnswer" as String. We can store the JSON feedback stringified here for retrieval.
              maxPoints: 9.0
          });
      }
      if (task2) {
          answersToSave.push({
              questionId: task2.id,
              userAnswer: task2.answer,
              isCorrect: true,
              correctAnswer: JSON.stringify(aiResult.task2),
              maxPoints: 9.0
          });
      }

      const newResult = new UserExamResult({
        userId,
        examId,
        score: parseFloat(finalScore.toFixed(1)),
        totalQuestions: answersToSave.length,
        answers: answersToSave,
        completedAt: new Date()
      });

      await newResult.save();

      console.log(`[Backend] Saved result ${newResult._id}`);

      // 5. Return Result
      res.status(200).json({
        success: true,
        data: {
            resultId: newResult._id,
            scores: {
                overall: finalScore.toFixed(1),
                task1: score1,
                task2: score2
            },
            feedback: {
                task1: aiResult.task1,
                task2: aiResult.task2
            }
        }
      });

    } catch (error) {
      console.error("[Backend] Submit Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get Result by ID
  async getResult(req, res) {
      try {
          const result = await UserExamResult.findById(req.params.id)
            .populate('examId', 'title')
            .populate('userId', 'username email');
          
          if (!result) return res.status(404).json({ success: false, message: "Result not found" });
          
          // Parse JSON feedback if stored in correctAnswer
          const formattedAnswers = result.answers.map(a => {
            let feedback = null;
            try {
                if (a.correctAnswer && a.correctAnswer.startsWith("{")) {
                    feedback = JSON.parse(a.correctAnswer);
                }
            } catch (e) {}
            return {
                ...a.toObject(),
                feedback
            };
          });

          // Map answers back to task1/task2 for Frontend compatibility
          const task1 = formattedAnswers.find(a => a.userAnswer && a.userAnswer.length > 10 && (!a.maxPoints || a.maxPoints === 9)); // Simple heuristic
          const task2 = formattedAnswers.find(a => a !== task1);

          res.json({ 
            success: true, 
            data: { 
                ...result.toObject(), 
                task1: task1 ? { result: task1.feedback } : null,
                task2: task2 ? { result: task2.feedback } : null,
                overallBand: result.score
            } 
          });
      } catch (error) {
          res.status(500).json({ success: false, message: error.message });
      }
  }
}

module.exports = new WritingExamController();
