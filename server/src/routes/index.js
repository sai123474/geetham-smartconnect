import express from "express";
import authRoutes from "./authRoutes.js";
import protectedRoutes from "./protectedRoutes.js";
import studentRoutes from "./studentRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";
import complaintRoutes from "./complaintRoutes.js";
import feeRoutes from "./feeRoutes.js";
import hallTicketRoutes from "./hallTicketRoutes.js";
import progressRoutes from "./progressRoutes.js";
import settingRoutes from "./settingRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import leaveRoutes from "./leaveRoutes.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API live" });
});

// Auth
router.use("/auth", authRoutes);

// RBAC test routes
router.use("/protected", protectedRoutes);

// Students
router.use("/students", studentRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/hall-ticket", hallTicketRoutes);
router.use("/complaints", complaintRoutes);
router.use("/fees", feeRoutes);
router.use("/progress", progressRoutes);
router.use("/settings", settingRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/leave", leaveRoutes);

export default router;
