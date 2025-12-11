// routes/ai.js
const express = require("express");
const router = express.Router();
const { analyzeWriting } = require("../services/writing.service");
const { analyzeSpeaking } = require("../services/speaking.service");

// New: Batch evaluation for full writing exam
router.post("/score/writing/exam", async (req, res) => {
  try {
    const { task1, task2 } = req.body;
    // req.body example:
    // { 
    //   task1: { essay: "...", question: "...", type: "bar_chart" }, 
    //   task2: { essay: "...", question: "...", type: "opinion" } 
    // }

    const promises = [];
    
    // Task 1
    if (task1 && task1.essay && task1.essay.trim().length > 10) {
      promises.push(
        analyzeWriting(task1.essay, task1.question, task1.type || "Task 1")
          .then(res => ({ task1: res }))
          .catch(err => ({ task1: { error: err.message } }))
      );
    } else {
        promises.push(Promise.resolve({ task1: null }));
    }

    // Task 2
    if (task2 && task2.essay && task2.essay.trim().length > 10) {
      promises.push(
        analyzeWriting(task2.essay, task2.question, task2.type || "Task 2")
          .then(res => ({ task2: res }))
          .catch(err => ({ task2: { error: err.message } }))
      );
    } else {
        promises.push(Promise.resolve({ task2: null }));
    }

    const results = await Promise.all(promises);
    const combinedData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});

    res.json({ success: true, data: combinedData });

  } catch (err) {
    console.error("Batch Writing error:", err);
    res.status(500).json({ success: false, error: "Lỗi AI Batch Writing" });
  }
});

router.post("/score/writing", async (req, res) => {
  try {
    const { essay, question, type } = req.body;
    if (!essay) return res.status(400).json({ error: "Thiếu essay" });
    const result = await analyzeWriting(essay, question, type);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Writing error:", err);
    res.status(500).json({ success: false, error: "Lỗi AI Writing" });
  }
});

router.post("/score/speaking", async (req, res) => {
  try {
    const { transcript, question, part } = req.body;
    if (!transcript) return res.status(400).json({ error: "Thiếu transcript" });
    const result = await analyzeSpeaking(transcript, question, part);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: "Lỗi AI Speaking" });
  }
});



module.exports = router;
