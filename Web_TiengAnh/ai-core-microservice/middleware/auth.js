// middleware/auth.js
const verifyAPIKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"] || req.query.apikey;

  if (!apiKey) {
    return res.status(401).json({ error: "Thiếu x-api-key header" });
  }

  if (apiKey !== process.env.SERVICE_API_KEY) {
    return res.status(403).json({ error: "API Key sai" });
  }

  next();
};

module.exports = { verifyAPIKey };
