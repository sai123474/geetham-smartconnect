import { HostelEntryLog } from "../models/HostelEntryLog.js";
import { LeaveRequest } from "../models/LeaveRequest.js";
import { Student } from "../models/Student.js";

// POST /api/hostel/scan
export const scanHostelQr = async (req, res, next) => {
  try {
    const { studentId, direction, leaveRequestId } = req.body;

    if (!studentId || !direction) {
      return res
        .status(400)
        .json({ message: "studentId and direction are required" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    let leave = null;
    if (leaveRequestId) {
      leave = await LeaveRequest.findById(leaveRequestId);
      if (!leave) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      if (leave.status !== "approved") {
        return res
          .status(400)
          .json({ message: "Leave not approved yet for this student" });
      }
    }

    const log = await HostelEntryLog.create({
      studentId,
      direction,
      leaveRequestId: leave?._id || null,
      scannedBy: req.user._id
    });

    res.json({
      status: "success",
      log
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/hostel/logs?studentId=&days=7
export const getHostelLogs = async (req, res, next) => {
  try {
    const { studentId, days = 7 } = req.query;

    const filter = {};
    if (studentId) filter.studentId = studentId;

    const since = new Date();
    since.setDate(since.getDate() - Number(days));
    filter.scannedAt = { $gte: since };

    const logs = await HostelEntryLog.find(filter)
      .populate("studentId", "name className section admissionNo")
      .populate("leaveRequestId")
      .sort({ scannedAt: -1 });

    res.json({ status: "success", logs });
  } catch (err) {
    next(err);
  }
};
