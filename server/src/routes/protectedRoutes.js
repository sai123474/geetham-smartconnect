import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Only logged in users
router.get("/profile", protect, (req, res) => {
  res.json({
    message: `Hello ${req.user.name}, your role is ${req.user.role}`
  });
});

// Only Admin can access
router.get("/admin-only", protect, restrictTo("admin"), (req, res) => {
  res.json({
    message: "Admin route accessed successfully"
  });
});

// Example: Only teacher and admin
router.get("/teacher-section", protect, restrictTo("admin", "teacher"), (req, res) => {
  res.json({
    message: "Teacher section access granted"
  });
});

export default router;

