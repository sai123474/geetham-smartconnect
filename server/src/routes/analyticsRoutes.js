import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import {
  getClassExamAnalytics,
  getToppersForDisplay
} from "../controllers/analyticsController.js";

const router = express.Router();

// class analytics – for staff/principal dashboards
router.get(
  "/class-exam",
  protect,
  restrictTo("teacher", "staff", "admin", "dean", "principal"),
  getClassExamAnalytics
);

// toppers – can be public for prayer hall
router.get("/toppers", getToppersForDisplay);

export default router;
