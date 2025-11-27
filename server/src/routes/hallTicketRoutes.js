import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import {
  calculateEligibility,
  approveHallTicket,
  generateHallTicketPdf
} from "../controllers/hallTicketController.js";

const router = express.Router();

router.use(protect);

// Calculate + create hall ticket record
router.post(
  "/eligibility",
  restrictTo("admin", "dean", "principal", "staff"),
  calculateEligibility
);

// Approve (admin or dean)
router.post(
  "/:hallTicketId/approve",
  restrictTo("admin", "dean"),
  approveHallTicket
);

// Generate PDF (after both approvals)
router.post(
  "/:hallTicketId/generate-pdf",
  restrictTo("admin", "dean", "principal", "staff"),
  generateHallTicketPdf
);

export default router;
