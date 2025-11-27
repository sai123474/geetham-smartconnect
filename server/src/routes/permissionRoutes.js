import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import {
  getPermissionsMatrix,
  updatePermissionsMatrix
} from "../controllers/permissionController.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo("superadmin", "dean", "principal"));

router.get("/", getPermissionsMatrix);
router.put("/", updatePermissionsMatrix);

export default router;
