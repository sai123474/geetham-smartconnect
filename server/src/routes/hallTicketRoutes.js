import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { calculateEligibility } from "../controllers/hallTicketController.js";

const router = express.Router();

router.use(protect);

router.post(
  "/eligibility",
  restrictTo("admin", "dean", "principal", "staff"),
  calculateEligibility
);

export default router;
