// Verify API key from main app (hardcode or from DB, but simple for now)
const SERVICE_API_KEY = process.env.SERVICE_API_KEY; // e.g., "your-secret-key-123"

const verifyAPIKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"] || req.query.apiKey;

  if (!apiKey || apiKey !== SERVICE_API_KEY) {
    return res.status(401).json({ error: "Invalid API Key" });
  }

  next();
};

module.exports = { verifyAPIKey };
