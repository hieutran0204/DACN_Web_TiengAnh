const fs = require('fs');
const axios = require('axios');
// const { COLAB_URL, TIMEOUT } = require('../../../microservices/microservice_speaking_AI/config'); 

const COLAB_URL = "https://stereotyped-corkier-camelia.ngrok-free.dev";
const TIMEOUT = 60000;

class AISpeakingService {
  async sendAudioToAI(filePath, topic) {
    try {
      // Node.js 18+ support native FormData and fetch
      const formData = new FormData();
      
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new Blob([fileBuffer], { type: 'audio/wav' }); 
      
      formData.append('audio', blob, 'recording.wav');
      if (topic) {
          formData.append('topic', topic);
      }

      console.log(`[AI Service] Sending audio to: ${COLAB_URL}/speak`);
      
      const response = await fetch(`${COLAB_URL}/speak`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(TIMEOUT),
        headers: {
            "ngrok-skip-browser-warning": "true" 
        }
      });

      console.log(`[AI Service] Response Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AI Service] Error Body: ${errorText}`);
        throw new Error(`AI Service responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Fix audio URL if relative
      if (data.reply_audio && !data.reply_audio.startsWith("http")) {
        data.reply_audio = `${COLAB_URL}${data.reply_audio}`;
      }
      
      return data;
    } catch (error) {
      console.error("❌ Link AI Service Error:", error.message);
      throw error;
    }
  }

  async gradeConversation() {
    try {
      console.log(`[AI Service] Requesting feedback from: ${COLAB_URL}/finish`);

      // The new Colab code uses internal state (history_db), so we don't send messages.
      const response = await axios.post(`${COLAB_URL}/finish`, {}, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        },
        timeout: TIMEOUT
      });

      console.log(`[AI Service] Feedback Response Status: ${response.status}`);
      
      const reportText = response.data.final_feedback || "No report generated.";
      
      // Parse the unstructured text report to fit our frontend structure
      // Expected format: "1. Overall Score... 2. Top 3 common mistakes... 3. Suggestions..."
      
      let score = "N/A";
      // Try to find "Score: 7" or "7/10" or similar
      const scoreMatch = reportText.match(/Score.*?(\d+[\.,]?\d*)/i);
      if (scoreMatch) {
        score = scoreMatch[1];
      }

      return {
          score: score,
          feedback: reportText,
          corrections: [] // We might want to parse this better later if the user requests it
      };

    } catch (error) {
      console.error("❌ Link AI Service Feedback Error:", error.message);
      if (error.response) {
         console.error("Error Data:", error.response.data);
         throw new Error(`AI Service failed: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}

module.exports = new AISpeakingService();
