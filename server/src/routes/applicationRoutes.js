import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import {
  createApplicationForm,
  approveApplication,
  generateApplicationPdf
} from "../controllers/applicationController.js";
import multer from "multer";

const upload = multer();

const router = express.Router();

router.post("/", upload.single("photo"), createApplicationForm);
router.patch("/:id/approve", protect, restrictTo("admin", "principal"), approveApplication);
router.post("/:id/generate-pdf", protect, restrictTo("admin", "principal"), generateApplicationPdf);

export default router;
