import express from "express";
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} from "../controllers/studentController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes below require login
router.use(protect);

// Only admin, dean, staff, teacher can manage students
router.post(
  "/",
  restrictTo("admin", "dean", "staff", "teacher"),
  createStudent
);

router.get(
  "/",
  restrictTo("admin", "dean", "staff", "teacher"),
  getStudents
);

router.get(
  "/:id",
  restrictTo("admin", "dean", "staff", "teacher"),
  getStudentById
);

router.put(
  "/:id",
  restrictTo("admin", "dean", "staff", "teacher"),
  updateStudent
);

router.delete(
  "/:id",
  restrictTo("admin", "dean", "staff"),
  deleteStudent
);

export default router;
