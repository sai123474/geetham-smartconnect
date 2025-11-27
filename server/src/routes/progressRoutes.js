import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import {
  upsertProgressReport,
  getProgressReport,
  generateProgressCardPdf
} from "../controllers/progressController.js";

const router = express.Router();

router.use(protect);

// Create/Update progress report – teacher, staff, admin, dean
router.post(
  "/student/:studentId",
  restrictTo("teacher", "staff", "admin", "dean", "principal"),
  upsertProgressReport
);

// Get report for viewing – staff + student/parent (later you can limit)
router.get(
  "/student/:studentId",
  restrictTo("teacher", "staff", "admin", "dean", "principal"),
  getProgressReport
);

// Generate PDF – admin/dean/principal
router.post(
  "/:reportId/generate-pdf",
  restrictTo("admin", "dean", "principal"),
  generateProgressCardPdf
);

export default router;
