const express = require('express');
const path = require('path');
const router = express.Router();
const graphService = require('../services/graph.service');
const memoryService = require('../services/graph/memory.service');
const ruleBasedService = require('../services/nlp/rule-based.service');

/**
 * Endpoint để Python Script gọi vào sau khi nạp xong dữ liệu
 * Giúp server cập nhật từ vựng mới mà không cần restart
 */
router.post('/sync-vocab', async (req, res) => {
  try {
    console.log("🔄 Nhận lệnh đồng bộ từ vựng từ Python Script...");
    
    // 1. Đồng bộ từ Neo4j
    const wordNames = await graphService.getAllWordNames();
    ruleBasedService.setAcademicWords(wordNames);

    // 2. Đồng bộ từ folder /md
    const mdPath = path.resolve(__dirname, '../md');
    await ruleBasedService.bootstrapFromMarkdown(mdPath);

    res.json({ 
      success: true, 
      message: "Đồng bộ từ vựng & KG thành công",
      wordsCount: wordNames.length
    });
  } catch (error) {
    console.error("❌ Lỗi đồng bộ từ vựng:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 🟢 GET /api/graph/student-profile/:studentId
 * Trích xuất chân dung học viên từ Neo4j
 */
router.get('/student-profile/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const profile = await memoryService.getStudentProfile(studentId);
    
    if (!profile) {
      return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ học viên" });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error("❌ Lỗi lấy hồ sơ học viên:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
