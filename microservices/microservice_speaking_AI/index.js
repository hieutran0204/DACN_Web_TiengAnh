// microservices/microservice_speaking_AI/index.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { COLAB_URL, TIMEOUT } = require('./config');

const sendAudioToAI = async (filePath) => {
    try {
        const formData = new FormData();
        // Luồng đọc file âm thanh từ folder uploads của Backend
        formData.append('audio', fs.createReadStream(filePath));

        const response = await axios.post(`${COLAB_URL}/speak`, formData, {
            headers: { ...formData.getHeaders() },
            timeout: TIMEOUT
        });

        // Kết quả trả về từ FastAPI trên Colab
        return response.data; 
    } catch (error) {
        console.error("❌ Lỗi tại AI Microservice:", error.message);
        throw error;
    }
};

module.exports = { sendAudioToAI };