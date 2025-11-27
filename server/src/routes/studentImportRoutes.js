import express from "express";
import multer from "multer";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { previewStudentsCsv } from "../controllers/studentImportController.js";

const upload = multer();

const router = express.Router();

router.post(
  "/preview",
  protect,
  restrictTo("admin", "principal", "staff"),
  upload.single("file"),
  previewStudentsCsv
);

export default router;
