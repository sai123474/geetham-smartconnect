import { Attendance } from "../models/Attendance.js";
import { HallTicket } from "../models/HallTicket.js";
import { Student } from "../models/Student.js";
import { FeeStructure } from "../models/FeeStructure.js";
import { Concession } from "../models/Concession.js";
import { FeeTransaction } from "../models/FeeTransaction.js";

// Helper to compute fee due until selected quarter
const computeFeeDueUntilQuarter = async (student, academicYear, quarter) => {
  const structure = await FeeStructure.findOne({
    academicYear,
    className: student.className,
    $or: [{ section: student.section }, { section: "ALL" }]
  }).sort({ section: -1 });

  if (!structure) return { feeDue: 0, totalFee: 0 };

  const quarterOrder = ["Q1", "Q2", "Q3", "Q4", "FINAL"];
  const maxIndex = quarterOrder.indexOf(quarter);

  let totalFee = 0;
  let payableQuarters = structure.quarters.slice(0, maxIndex + 1);

  for (const fq of payableQuarters) {
    totalFee += structure.feeHeads.reduce((sum, h) => {
      if (h.frequency === "quarterly") return sum + h.amount;
      if (h.frequency === "annual") return sum + h.amount / 4;
      return sum + h.amount;
    }, 0);
  }

  const concessions = await Concession.find({
    studentId: student._id,
    academicYear,
    isActive: true
  });

  const concessionAmountFromFixed = concessions.reduce(
    (sum, c) => sum + (c.amount || 0),
    0
  );

  const concessionPct = concessions.reduce((sum, c) => sum + (c.percentage || 0), 0);

  const pctAmount = (totalFee * concessionPct) / 100;
  const totalConcession = concessionAmountFromFixed + pctAmount;

  const payments = await FeeTransaction.find({ studentId: student._id, academicYear });
  const totalPaid = payments.reduce((sum, t) => sum + t.amount, 0);

  const feeDue = Math.max(totalFee - totalConcession - totalPaid, 0);

  return { feeDue, totalFee, totalConcession, totalPaid };
};

// MAIN eligibility function
export const calculateEligibility = async (req, res, next) => {
  try {
    const { studentId, examName, quarter, attendanceRequired = 75, academicYear } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const total = await Attendance.countDocuments({ studentId });
    const present = await Attendance.countDocuments({ studentId, status: "present" });

    const attendancePercentage = total > 0 ? (present / total) * 100 : 0;

    const { feeDue } = await computeFeeDueUntilQuarter(student, academicYear, quarter);

    let eligible = true;
    let denialReason = null;

    if (attendancePercentage < attendanceRequired) {
      eligible = false;
      denialReason = `Insufficient Attendance (${attendancePercentage.toFixed(2)}%)`;
    }

    if (feeDue > 0) {
      eligible = false;
      denialReason = `Fee Due Pending: ₹${feeDue.toFixed(2)}`;
    }

    const hall = await HallTicket.create({
      studentId,
      examName,
      quarter,
      attendancePercentage,
      feeDue,
      eligible,
      denialReason
    });

    return res.json({
      status: "success",
      hall
    });
  } catch (error) {
    next(error);
  }
};
