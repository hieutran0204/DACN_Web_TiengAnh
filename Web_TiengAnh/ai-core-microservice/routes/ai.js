// routes/ai.js
const express = require("express");
const router = express.Router();
const {
  analyzeWriting,
  analyzeSpeaking,
} = require("../services/geminiService.js");

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
    console.error("Speaking error:", err);
    res.status(500).json({ success: false, error: "Lỗi AI Speaking" });
  }
});

module.exports = router;
