const aiService = require("../../../services/speaking/ai.service");

const path = require("path");
const fs = require("fs");

class SpeakingController {
  async chatWithAI(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Vui lòng gửi file âm thanh" });
      }

      const filePath = req.file.path;
      const topic = req.body.topic; 
      
      // Gửi file đến AI Service
      const aiResponse = await aiService.sendAudioToAI(filePath, topic);

      // Xóa file tạm sau khi xử lý xong (tùy chọn, để tiết kiệm dung lượng)
      //fs.unlinkSync(filePath); 

      // Trả về kết quả từ AI
      // aiResponse nên có định dạng: { text_reply: "...", audio_url: "..." }
      res.status(200).json({
        success: true,
        data: aiResponse
      });

    } catch (error) {
      console.error("Speaking Controller Error:", error);
      res.status(500).json({ message: error.message });
    }
  }

  async gradeConversation(req, res) {
    try {
      // The AI service now uses the conversation history stored in the Colab session
      const gradeResult = await aiService.gradeConversation();

      res.status(200).json({
        success: true,
        data: gradeResult
      });
    } catch (error) {
      console.error("Speaking Grading Error:", error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new SpeakingController();
