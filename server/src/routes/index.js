import express from "express";
import authRoutes from "./authRoutes.js";

const router = express.Router();

// Base health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API live" });
});

// Authentication
router.use("/auth", authRoutes);

export default router;
