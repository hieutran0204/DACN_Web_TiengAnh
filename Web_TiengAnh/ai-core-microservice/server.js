require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authMiddleware = require("./middleware/auth");
const aiRoutes = require("./routes/ai");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({ origin: process.env.APP_ORIGIN || "http://localhost:3000" })); // Allow calls from main app
app.use(morgan("combined")); // Logging
app.use(express.json({ limit: "10mb" })); // Parse JSON (for large audio/text)

// Routes
app.use("/api/ai", authMiddleware.verifyAPIKey, aiRoutes); // All AI routes protected by API key

// Health check
app.get("/health", (req, res) =>
  res.json({ status: "OK", service: "AI Core" })
);

app.listen(PORT, () => {
  console.log(`AI Core Microservice running on port ${PORT}`);
});
