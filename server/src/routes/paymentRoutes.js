import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { createAdmissionPayment, generatePaymentReceiptPdf } from "../controllers/paymentController.js";

const router = express.Router();

router.post(
  "/admission/:studentId",
  protect,
  restrictTo("admin", "accountant", "principal"),
  createAdmissionPayment
);

router.post(
  "/admission/:paymentId/receipt",
  protect,
  restrictTo("admin", "accountant", "principal"),
  generatePaymentReceiptPdf
);

export default router;
