import express from "express";
import multer from "multer";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { uploadLogo, getLogo } from "../controllers/settingController.js";

const router = express.Router();
const upload = multer(); // memory storage

router.use(protect);

router.post(
  "/logo",
  restrictTo("admin", "dean", "principal"),
  upload.single("logo"),
  uploadLogo
);

router.get("/logo", protect, getLogo);

export default router;
