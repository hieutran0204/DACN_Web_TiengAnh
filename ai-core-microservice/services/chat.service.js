const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
);

// Use gemini-1.5-flash for better speed and regional availability
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", 
  generationConfig: {
     maxOutputTokens: 1000,
     temperature: 0.9, 
  },
  systemInstruction: {
    parts: [
      { text: `You are an expert English Tutor AI named "TestKiller" (English Learning Smart Assistant).
      
      YOUR MISSIONS:
      1. Act as a friendly, encouraging English tutor.
      2. Analyze user's inputs. If they make grammar/vocab mistakes, gently correct them in Vietnamese.
      3. If they ask about words, provide definitions, synonyms, and examples.
      4. Keep answers short, concise and fun. Use emojis 🌟.
      5. Support BOTH Vietnamese and English.
      
      IMPORTANT:
      - If user says "hi", "hello", greet them warmly and ask what they want to learn today.
      - Do NOT be too formal.
      ` }
    ]
  }
});

const chatWithAI = async (message, history = []) => {
  try {
    // History format required by Gemini: { role: "user" | "model", parts: [{ text: "..." }] }
    // We assume input history is simplified [{ role: 'user', content: '...' }] and convert it.
    
    const formattedHistory = history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
        history: formattedHistory
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error("Chat Service Error Details:", error);
    // Return the actual error message for debugging purposes
    return `Error: ${error.message || "Unknown error occurred"}`;
  }
};

module.exports = {
  chatWithAI
};
