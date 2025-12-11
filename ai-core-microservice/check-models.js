
const fs = require('fs');
const https = require('https');

const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('available_models.json', data);
    console.log('Models saved to available_models.json');
  });
}).on('error', err => console.log('Error: ' + err.message));
