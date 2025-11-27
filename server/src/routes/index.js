import express from "express";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Geetham SmartConnect API is running",
    timestamp: new Date().toISOString()
  });
});

export default router;

