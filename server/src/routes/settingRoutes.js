import express from "express";
import multer from "multer";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { uploadLogo, uploadSignature, getLogo } from "../controllers/settingController.js";


const router = express.Router();
const upload = multer(); // memory storage

router.use(protect);

router.post(
  "/logo",
  restrictTo("admin", "dean", "principal"),
  upload.single("logo"),
  uploadLogo
);
router.post(
  "/signature/:role",
  restrictTo("admin", "principal", "dean"),
  upload.single("signature"),
  uploadSignature
);

router.get("/logo", protect, getLogo);

export default router;
