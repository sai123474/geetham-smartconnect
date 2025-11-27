import express from "express";
import multer from "multer";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import {
  createComplaint,
  getMyComplaints,
  assignComplaint,
  updateComplaintStatus,
  addComplaintComment,
  getComplaintById
} from "../controllers/complaintController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes protected
router.use(protect);

// Create complaint (student, parent, teacher, staff)
router.post(
  "/",
  restrictTo("student", "parent", "teacher", "staff"),
  upload.array("attachments", 5),
  createComplaint
);

// Get complaints relevant to current user
router.get("/my", getMyComplaints);

// Management: assign complaint to staff/teacher/warden
router.post(
  "/assign",
  restrictTo("admin", "principal", "dean"),
  assignComplaint
);

// View single complaint
router.get("/:complaintId", getComplaintById);

// Update status / escalate (staff + management)
router.patch(
  "/:complaintId/status",
  restrictTo("teacher", "staff", "admin", "principal", "dean"),
  updateComplaintStatus
);

// Add public comment
router.post("/:complaintId/comments", addComplaintComment);

export default router;
