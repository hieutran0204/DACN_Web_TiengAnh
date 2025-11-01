module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || "your-256-bit-secret",
    expiresIn: "1h",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
    refreshExpiresIn: "7d",
  },
};
