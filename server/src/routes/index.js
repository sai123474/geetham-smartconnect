import express from "express";
import authRoutes from "./authRoutes.js";
import protectedRoutes from "./protectedRoutes.js";
import studentRoutes from "./studentRoutes.js";

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

export default router;
