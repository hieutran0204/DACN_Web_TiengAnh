// routes/ai.js
const express = require("express");
const router  = express.Router();
const { analyzeWriting }  = require("../services/writing.service");
const { analyzeSpeaking } = require("../services/speaking.service");

/**
 * POST /api/ai/score/writing
 *
 * Body:
 *   essay      {string}  - student's essay (required)
 *   question   {string}  - essay topic/prompt
 *   type       {string}  - essay type (opinion, bar_chart, ...)
 *   studentId  {string}  - (optional) enables GraphRAG personalization
 *   essayId    {string}  - (optional) required for graph memory update
 */
router.post("/score/writing", async (req, res) => {
  try {
    const { essay, question, type, studentId, essayId } = req.body;
    if (!essay) return res.status(400).json({ error: "Thiếu essay" });

    const result = await analyzeWriting(essay, question, type, studentId, essayId);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Writing error:", err);
    res.status(500).json({ success: false, error: "Lỗi AI Writing" });
  }
});

/**
 * POST /api/ai/score/writing/exam
 * Batch: Task 1 + Task 2 in one call
 *
 * Body: { task1: { essay, question, type }, task2: { essay, question, type }, studentId, examId }
 */
router.post("/score/writing/exam", async (req, res) => {
  try {
    const { task1, task2, studentId, examId } = req.body;

    const promises = [];

    if (task1?.essay?.trim().length > 10) {
      promises.push(
        analyzeWriting(
          task1.essay,
          task1.question,
          task1.type || "Task 1",
          studentId,
          examId ? `${examId}_t1` : null
        )
          .then(data => ({ task1: data }))
          .catch(err  => ({ task1: { error: err.message } }))
      );
    } else {
      promises.push(Promise.resolve({ task1: null }));
    }

    if (task2?.essay?.trim().length > 10) {
      promises.push(
        analyzeWriting(
          task2.essay,
          task2.question,
          task2.type || "Task 2",
          studentId,
          examId ? `${examId}_t2` : null
        )
          .then(data => ({ task2: data }))
          .catch(err  => ({ task2: { error: err.message } }))
      );
    } else {
      promises.push(Promise.resolve({ task2: null }));
    }

    const results     = await Promise.all(promises);
    const combinedData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});

    res.json({ success: true, data: combinedData });
  } catch (err) {
    console.error("Batch Writing error:", err);
    res.status(500).json({ success: false, error: "Lỗi AI Batch Writing" });
  }
});

/**
 * POST /api/ai/score/speaking
 */
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
