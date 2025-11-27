import express from "express";
import multer from "multer";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { importMarksFromExcel } from "../controllers/marksImportController.js";

const upload = multer();

const router = express.Router();

router.post(
  "/marks/import-excel",
  protect,
  restrictTo("teacher", "staff", "admin", "dean", "principal"),
  upload.single("file"),
  importMarksFromExcel
);

export default router;
