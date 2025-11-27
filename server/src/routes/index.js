import express from "express";
import authRoutes from "./authRoutes.js";
import protectedRoutes from "./protectedRoutes.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API live" });
});

router.use("/auth", authRoutes);
router.use("/protected", protectedRoutes);

export default router;
