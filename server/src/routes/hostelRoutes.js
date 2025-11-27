import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { scanHostelQr, getHostelLogs } from "../controllers/hostelAttendanceController.js";

const router = express.Router();

router.use(protect);

// Warden, staff, admin can scan
router.post(
  "/scan",
  restrictTo("staff", "admin", "dean", "principal", "teacher"),
  scanHostelQr
);

// View logs (warden, admin, principal)
router.get(
  "/logs",
  restrictTo("staff", "admin", "dean", "principal"),
  getHostelLogs
);

export default router;
