import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createLeaveRequest, generateLeavePdf } from "../controllers/leaveController.js";

const router = express.Router();

router.use(protect);

router.post("/", createLeaveRequest);
router.post("/:id/generate-pdf", generateLeavePdf);

export default router;
