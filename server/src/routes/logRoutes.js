// server/src/routes/logRoutes.js
import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import {
  exportAuditLogsCsv,
  exportAuditLogsPdf,
} from "../controllers/auditController.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo("superadmin", "dean", "principal", "admin"));

router.get("/export/csv", exportAuditLogsCsv);
router.get("/export/pdf", exportAuditLogsPdf);

export default router;
