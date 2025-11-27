// server/src/routes/sessionRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { LoginSession } from "../models/LoginSession.js";

const router = express.Router();

router.use(protect);

// Get my active sessions
router.get("/me", async (req, res, next) => {
  try {
    const sessions = await LoginSession.find({ user: req.user._id })
      .sort({ isActive: -1, updatedAt: -1 })
      .lean();

    res.json({ status: "success", sessions });
  } catch (err) {
    next(err);
  }
});

// Logout a specific session (from any device)
router.patch("/:id/logout", async (req, res, next) => {
  try {
    const session = await LoginSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!session)
      return res
        .status(404)
        .json({ status: "error", message: "Session not found" });

    session.isActive = false;
    await session.save();

    res.json({ status: "success", message: "Session logged out" });
  } catch (err) {
    next(err);
  }
});

export default router;
