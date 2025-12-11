const express = require("express");
const router = express.Router();
const { chatWithAI } = require("../services/chat.service");

router.post("/", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Default history to empty array if not provided
    const chatHistory = Array.isArray(history) ? history : [];
    
    const responseText = await chatWithAI(message, chatHistory);
    
    res.json({ 
      success: true, 
      data: responseText 
    });

  } catch (error) {
    console.error("Chat Route Error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});

module.exports = router;
