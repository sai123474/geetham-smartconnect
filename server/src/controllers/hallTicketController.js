import { Attendance } from "../models/Attendance.js";
import { HallTicket } from "../models/HallTicket.js";
import { Student } from "../models/Student.js";
import { FeeStructure } from "../models/FeeStructure.js";
import { Concession } from "../models/Concession.js";
import { FeeTransaction } from "../models/FeeTransaction.js";
import { generateHallTicketPdfBuffer } from "../utils/hallTicketPdf.js";
import { uploadToS3 } from "../utils/s3.js";

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
  const payableQuarters = structure.quarters.slice(0, maxIndex + 1);

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

  const concessionPct = concessions.reduce(
    (sum, c) => sum + (c.percentage || 0),
    0
  );

  const pctAmount = (totalFee * concessionPct) / 100;
  const totalConcession = concessionAmountFromFixed + pctAmount;

  const payments = await FeeTransaction.find({
    studentId: student._id,
    academicYear
  });
  const totalPaid = payments.reduce((sum, t) => sum + t.amount, 0);

  const feeDue = Math.max(totalFee - totalConcession - totalPaid, 0);

  return { feeDue, totalFee, totalConcession, totalPaid };
};

// 1) Calculate eligibility + create HallTicket record
export const calculateEligibility = async (req, res, next) => {
  try {
    const { studentId, examName, quarter, attendanceRequired = 75, academicYear } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const total = await Attendance.countDocuments({ studentId });
    const present = await Attendance.countDocuments({
      studentId,
      status: "present"
    });

    const attendancePercentage = total > 0 ? (present / total) * 100 : 0;

    const { feeDue } = await computeFeeDueUntilQuarter(
      student,
      academicYear,
      quarter
    );

    let eligible = true;
    let denialReason = null;

    if (attendancePercentage < attendanceRequired) {
      eligible = false;
      denialReason = `Insufficient Attendance (${attendancePercentage.toFixed(
        2
      )}%)`;
    }

    if (feeDue > 0) {
      eligible = false;
      denialReason = `Fee Due Pending: ₹${feeDue.toFixed(2)}`;
    }
const hall = await HallTicket.create({
  studentId,
  examName,
  quarter,
  academicYear,
  attendancePercentage,
  feeDue,
  eligible,
  denialReason,
  subjects: req.body.subjects || []
});


    return res.json({
      status: "success",
      hall
    });
  } catch (error) {
    next(error);
  }
};

// 2) Approve hall ticket (admin/dean)
export const approveHallTicket = async (req, res, next) => {
  try {
    const { hallTicketId } = req.params;

    const hall = await HallTicket.findById(hallTicketId).populate("studentId");
    if (!hall) return res.status(404).json({ message: "Hall ticket not found" });

    if (!hall.eligible) {
      return res
        .status(400)
        .json({ message: `Not eligible: ${hall.denialReason || "Unknown reason"}` });
    }

    if (req.user.role === "admin") {
      hall.approvedByAdmin = true;
      hall.approvedByAdminUser = req.user._id;

      if (!hall.hallTicketNumber) {
        hall.hallTicketNumber = `GH-${hall.academicYear}-${hall.quarter}-${String(
          hall._id
        ).slice(-6)}`;
      }
    } else if (req.user.role === "dean") {
      hall.approvedByDean = true;
      hall.approvedByDeanUser = req.user._id;
    } else {
      return res
        .status(403)
        .json({ message: "Only admin or dean can approve hall tickets" });
    }

    await hall.save();

    res.json({
      status: "success",
      hall
    });
  } catch (error) {
    next(error);
  }
};

// 3) Generate Hall Ticket PDF (only if eligible + both approvals)
export const generateHallTicketPdf = async (req, res, next) => {
  try {
    const { hallTicketId } = req.params;

    const hall = await HallTicket.findById(hallTicketId).populate("studentId");
    if (!hall) return res.status(404).json({ message: "Hall ticket not found" });

    if (!hall.eligible) {
      return res
        .status(400)
        .json({ message: `Not eligible: ${hall.denialReason || "Unknown reason"}` });
    }

    if (!hall.approvedByAdmin || !hall.approvedByDean) {
      return res.status(400).json({
        message: "Hall ticket must be approved by both Admin and Dean before PDF generation"
      });
    }

    if (!hall.hallTicketNumber) {
      hall.hallTicketNumber = `GH-${hall.academicYear}-${hall.quarter}-${String(
        hall._id
      ).slice(-6)}`;
      await hall.save();
    }

    const buffer = await generateHallTicketPdfBuffer({
      student: hall.studentId,
      hallTicket: hall
    });

    const uploaded = await uploadToS3(
      buffer,
      `hallticket_${hall.hallTicketNumber}.pdf`,
      "application/pdf",
      "hall-tickets"
    );

    hall.generatedPdfUrl = uploaded.Location;
    await hall.save();

    res.json({
      status: "success",
      pdfUrl: hall.generatedPdfUrl,
      hallTicketNumber: hall.hallTicketNumber
    });
  } catch (error) {
    next(error);
  }
};
