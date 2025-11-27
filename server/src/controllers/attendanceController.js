import { Attendance } from "../models/Attendance.js";
import { Student } from "../models/Student.js";
import { HallTicket } from "../models/HallTicket.js";

export const markAttendance = async (req, res, next) => {
  try {
    const { records } = req.body;

    if (!records || !records.length) {
      return res.status(400).json({ message: "Attendance records required" });
    }

    const bulkDocs = records.map((rec) => ({
      updateOne: {
        filter: {
          studentId: rec.studentId,
          date: rec.date,
          period: rec.period || "full-day"
        },
        update: {
          $set: {
            status: rec.status,
            className: rec.className,
            section: rec.section,
            markedBy: req.user._id,
            source: "manual"
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(bulkDocs);

    res.json({
      status: "success",
      message: "Attendance marked successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const calculateAttendance = async (req, res, next) => {
  try {
    const { studentId, examName, attendanceRequired = 75 } = req.body;

    const total = await Attendance.countDocuments({ studentId });
    const present = await Attendance.countDocuments({
      studentId,
      status: "present"
    });

    const percentage = total > 0 ? (present / total) * 100 : 0;

    res.json({
      studentId,
      examName,
      total,
      present,
      percentage
    });
  } catch (error) {
    next(error);
  }
};

export const generateHallTicket = async (req, res, next) => {
  try {
    const { studentId, examName, attendanceRequired = 75, feeDue = 0 } = req.body;

    const total = await Attendance.countDocuments({ studentId });
    const present = await Attendance.countDocuments({
      studentId,
      status: "present"
    });

    const percentage = total > 0 ? (present / total) * 100 : 0;
    const eligible = percentage >= attendanceRequired && feeDue <= 0;

    const hall = await HallTicket.create({
      studentId,
      examName,
      attendancePercentage: percentage,
      feeDue,
      eligible,
      approvedByAdmin: false,
      approvedByDean: false
    });

    res.json({
      status: "success",
      hall
    });
  } catch (error) {
    next(error);
  }
};
