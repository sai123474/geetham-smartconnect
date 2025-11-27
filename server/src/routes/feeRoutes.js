import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import {
  upsertFeeStructure,
  getFeeStructure,
  recordManualPayment,
  addConcession,
  getStudentFeeSummary,
  generateFeeDueLetter,
  notifyDefaulters
} from "../controllers/feeController.js";

const router = express.Router();

// All fee routes require login
router.use(protect);

// Create/Update fee structure (Admin/Dean/Principal/Accounts)
router.post(
  "/structure",
  restrictTo("admin", "dean", "principal", "staff"),
  upsertFeeStructure
);

router.get(
  "/structure",
  restrictTo("admin", "dean", "principal", "staff"),
  getFeeStructure
);

// Manual fee collection
router.post(
  "/payment",
  restrictTo("admin", "dean", "principal", "staff"),
  recordManualPayment
);

// Concessions
router.post(
  "/concession",
  restrictTo("admin", "dean", "principal"),
  addConcession
);

// Student summary
router.get(
  "/student/:studentId/summary",
  restrictTo("admin", "dean", "principal", "staff", "teacher"),
  getStudentFeeSummary
);

// Fee due letter (office + student copy)
router.post(
  "/due-letter",
  restrictTo("admin", "dean", "principal", "staff"),
  generateFeeDueLetter
);

// Notify defaulters (bulk)
router.post(
  "/notify-defaulters",
  restrictTo("admin", "dean", "principal"),
  notifyDefaulters
);

export default router;
