const express = require("express");
const router = express.Router();
const {
  scoreWriting,
  scoreSpeaking,
  generateFeedback,
} = require("../services/geminiService"); // ← Thay tên file

// Các endpoint giữ nguyên như trước
router.post("/score/writing", async (req, res) => {
  try {
    const { essay } = req.body;
    if (!essay) return res.status(400).json({ error: "Missing essay" });

    const result = await scoreWriting(essay);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Writing score error:", error);
    res.status(500).json({ error: "AI Scoring failed" });
  }
});

// Tương tự cho /score/speaking và /feedback...
