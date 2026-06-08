require("dotenv").config();
const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const cors = require("cors");  // ← ADD THIS (install first: npm install cors)

const connectDB = require("./config/db");
const Url = require("./models/Url");
const redisClient = require("./config/redis");

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());  // ← ADD THIS - enables CORS for Render
app.use(express.json());

// Rate limiting for shorten API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use("/api/shorten", limiter);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// ✅ HEALTH CHECK ENDPOINT - MUST BE BEFORE THE /:code ROUTE
// ===============================
app.get("/health", async (req, res) => {
  const healthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      mongodb: false,
      redis: false
    }
  };

  // Check MongoDB connection
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState === 1) {
      healthStatus.services.mongodb = true;
    } else {
      healthStatus.status = "unhealthy";
    }
  } catch (err) {
    healthStatus.services.mongodb = false;
    healthStatus.status = "unhealthy";
  }

  // Check Redis connection
  try {
    if (redisClient && typeof redisClient.get === "function") {
      // Try a simple ping to verify connection
      const testPing = await redisClient.get("health-test");
      healthStatus.services.redis = true;
    } else {
      healthStatus.services.redis = false;
    }
  } catch (err) {
    healthStatus.services.redis = false;
  }

  const allCritical = healthStatus.services.mongodb; // MongoDB is critical
  res.status(allCritical ? 200 : 503).json(healthStatus);
});

// ===============================
// ✅ API Routes
// ===============================
app.use("/api", require("./routes/url"));

// ===============================
// 🔴 ROOT REDIRECT HANDLER - MUST BE LAST!
// ===============================
app.get("/:code", async (req, res) => {
  try {
    const code = req.params.code;
    
    // Skip if it's the health endpoint (should never hit here due to order, but just in case)
    if (code === "health") {
      return res.redirect("/health");
    }
    
    let cachedUrl = null;

    // 1️⃣ Try Redis (if available)
    try {
      cachedUrl = await redisClient.get(code);
    } catch (redisErr) {
      console.log("Redis not available, skipping cache");
    }

    if (cachedUrl) {
      return res.redirect(cachedUrl);
    }

    // 2️⃣ Fallback to MongoDB
    const url = await Url.findOne({ shortCode: code });
    if (!url) return res.status(404).send("Not found");

    // 3️⃣ Expiry check
    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).send("Link expired");
    }

    // 4️⃣ Update analytics
    url.clicks++;
    await url.save();

    // 5️⃣ Try to cache in Redis
    try {
      await redisClient.set(code, url.longUrl, { EX: 3600 });
    } catch (redisErr) {
      console.log("Redis not available, skipping cache set");
    }

    return res.redirect(url.longUrl);

  } catch (err) {
    console.error("Redirect error:", err);
    res.status(500).send("Server error");
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

