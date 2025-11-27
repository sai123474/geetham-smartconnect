import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import {
  createLeaveRequest,
  generateLeavePdf,
  listLeaveRequests,
  updateLeaveStatus
} from "../controllers/leaveController.js";

const router = express.Router();

router.use(protect);

// students
router.post("/", restrictTo("student"), createLeaveRequest);
router.post("/:id/generate-pdf", generateLeavePdf);

// warden/staff/admin/principal
router.get(
  "/list",
  restrictTo("staff", "admin", "dean", "principal"),
  listLeaveRequests
);

router.patch(
  "/:id/status",
  restrictTo("staff", "admin", "dean", "principal"),
  updateLeaveStatus
);

export default router;
