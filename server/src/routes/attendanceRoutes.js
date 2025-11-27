import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { markAttendance, calculateAttendance, generateHallTicket } from "../controllers/attendanceController.js";

const router = express.Router();

// Teachers & Admin can mark attendance
router.post("/mark", protect, restrictTo("teacher", "admin", "staff"), markAttendance);

// Generate hall ticket eligibility data
router.post("/calculate", protect, restrictTo("admin", "dean"), calculateAttendance);

// Create hall ticket record
router.post("/generate", protect, restrictTo("admin", "dean"), generateHallTicket);

export default router;
