import { Student } from "../models/Student.js";

// Create Student
export const createStudent = async (req, res, next) => {
  try {
    const {
      admissionNo,
      name,
      rollNo,
      className,
      section,
      gender,
      dob,
      parentName,
      parentPhone,
      address
    } = req.body;

    if (!admissionNo || !name || !className || !section) {
      return res.status(400).json({
        message: "admissionNo, name, className, section are required"
      });
    }

    const existing = await Student.findOne({ admissionNo });
    if (existing) {
      return res.status(409).json({ message: "Admission number already exists" });
    }

    const student = await Student.create({
      admissionNo,
      name,
      rollNo,
      className,
      section,
      gender,
      dob,
      parentName,
      parentPhone,
      address,
      createdBy: req.user?._id
    });

    return res.status(201).json({
      status: "success",
      student
    });
  } catch (error) {
    next(error);
  }
};

// Get all students (with optional filters)
export const getStudents = async (req, res, next) => {
  try {
    const { className, section, search } = req.query;

    const filter = { isActive: true };

    if (className) filter.className = className;
    if (section) filter.section = section;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { admissionNo: new RegExp(search, "i") }
      ];
    }

    const students = await Student.find(filter).sort({
      className: 1,
      section: 1,
      rollNo: 1,
      name: 1
    });

    res.json({
      status: "success",
      count: students.length,
      students
    });
  } catch (error) {
    next(error);
  }
};

// Get single student by ID
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student || !student.isActive) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      status: "success",
      student
    });
  } catch (error) {
    next(error);
  }
};

// Update student
export const updateStudent = async (req, res, next) => {
  try {
    const updates = req.body;

    const student = await Student.findById(req.params.id);
    if (!student || !student.isActive) {
      return res.status(404).json({ message: "Student not found" });
    }

    Object.assign(student, updates);
    await student.save();

    res.json({
      status: "success",
      student
    });
  } catch (error) {
    next(error);
  }
};

// Soft delete student (mark inactive)
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student || !student.isActive) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.isActive = false;
    await student.save();

    res.json({
      status: "success",
      message: "Student deactivated"
    });
  } catch (error) {
    next(error);
  }
};
