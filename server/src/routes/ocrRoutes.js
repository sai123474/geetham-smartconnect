import express from "express";
import multer from "multer";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { startOcrExtraction } from "../controllers/ocrController.js";

const upload = multer();

const router = express.Router();

router.post(
  "/marks/ocr",
  protect,
  restrictTo("teacher", "staff", "admin"),
  upload.single("file"),
  startOcrExtraction
);

export default router;
