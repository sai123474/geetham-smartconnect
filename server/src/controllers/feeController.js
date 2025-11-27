import { FeeStructure } from "../models/FeeStructure.js";
import { FeeTransaction } from "../models/FeeTransaction.js";
import { Concession } from "../models/Concession.js";
import { Student } from "../models/Student.js";
import { sendEmail, sendWhatsApp } from "../utils/notification.js";

// ---------- Helper to compute total fee from structure ----------
const computeTotalFeeFromStructure = (structure) => {
  if (!structure) return 0;
  return structure.feeHeads.reduce((sum, h) => sum + (h.amount || 0), 0);
};

// ---------- 1. Create or update fee structure ----------
export const upsertFeeStructure = async (req, res, next) => {
  try {
    const { academicYear, className, section = "ALL", feeHeads, quarters } =
      req.body;

    if (!academicYear || !className || !feeHeads || !feeHeads.length) {
      return res.status(400).json({
        message: "academicYear, className and feeHeads are required"
      });
    }

    const data = {
      academicYear,
      className,
      section,
      feeHeads,
      quarters,
      createdBy: req.user._id
    };

    const structure = await FeeStructure.findOneAndUpdate(
      { academicYear, className, section },
      data,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      status: "success",
      structure
    });
  } catch (error) {
    next(error);
  }
};

// ---------- 2. Get fee structure for a class ----------
export const getFeeStructure = async (req, res, next) => {
  try {
    const { academicYear, className, section = "ALL" } = req.query;

    const structure = await FeeStructure.findOne({
      academicYear,
      className,
      section
    });

    res.json({
      status: "success",
      structure
    });
  } catch (error) {
    next(error);
  }
};

// ---------- 3. Record manual payment ----------
export const recordManualPayment = async (req, res, next) => {
  try {
    const {
      studentId,
      academicYear,
      amount,
      mode,
      quarter,
      feeHeads,
      receiptNo,
      remarks
    } = req.body;

    if (!studentId || !academicYear || !amount || !receiptNo) {
      return res.status(400).json({
        message: "studentId, academicYear, amount, receiptNo are required"
      });
    }

    const txn = await FeeTransaction.create({
      studentId,
      academicYear,
      amount,
      mode: mode || "cash",
      quarter: quarter || "OTHER",
      feeHeads: feeHeads || [],
      receiptNo,
      remarks,
      collectedBy: req.user._id
    });

    res.status(201).json({
      status: "success",
      transaction: txn
    });
  } catch (error) {
    next(error);
  }
};

// ---------- 4. Add concession ----------
export const addConcession = async (req, res, next) => {
  try {
    const { studentId, academicYear, type, amount, percentage, reason } =
      req.body;

    if (!studentId || !academicYear || !type) {
      return res.status(400).json({
        message: "studentId, academicYear and type are required"
      });
    }

    const concession = await Concession.create({
      studentId,
      academicYear,
      type,
      amount: amount || 0,
      percentage: percentage || 0,
      reason,
      approvedBy: req.user._id
    });

    res.status(201).json({
      status: "success",
      concession
    });
  } catch (error) {
    next(error);
  }
};

// ---------- 5. Compute student fee summary ----------
export const getStudentFeeSummary = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const structure = await FeeStructure.findOne({
      academicYear,
      className: student.className,
      $or: [{ section: student.section }, { section: "ALL" }]
    }).sort({ section: -1 }); // prefer exact section

    const totalFee = computeTotalFeeFromStructure(structure);

    const concessions = await Concession.find({
      studentId,
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

    const payments = await FeeTransaction.find({ studentId, academicYear });

    const totalPaid = payments.reduce((sum, t) => sum + t.amount, 0);

    const netPayable = Math.max(totalFee - totalConcession, 0);
    const feeDue = Math.max(netPayable - totalPaid, 0);

    res.json({
      status: "success",
      student: {
        id: student._id,
        name: student.name,
        className: student.className,
        section: student.section,
        admissionNo: student.admissionNo
      },
      academicYear,
      structure,
      totalFee,
      concessions,
      totalConcession,
      totalPaid,
      netPayable,
      feeDue,
      payments
    });
  } catch (error) {
    next(error);
  }
};

// ---------- 6. Generate Fee Due Letter (Office + Student copy) ----------
export const generateFeeDueLetter = async (req, res, next) => {
  try {
    const { studentId, academicYear, quarterName, asOfDate } = req.body;

    const summaryRes = await new Promise((resolve, reject) => {
      // re-use logic by calling function directly is messy; so recompute here
      resolve(null);
    });

    // Recompute summary inline for this endpoint:
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const structure = await FeeStructure.findOne({
      academicYear,
      className: student.className,
      $or: [{ section: student.section }, { section: "ALL" }]
    }).sort({ section: -1 });

    const totalFee = computeTotalFeeFromStructure(structure);

    const concessions = await Concession.find({
      studentId,
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

    const payments = await FeeTransaction.find({ studentId, academicYear });

    const totalPaid = payments.reduce((sum, t) => sum + t.amount, 0);
    const netPayable = Math.max(totalFee - totalConcession, 0);
    const feeDue = Math.max(netPayable - totalPaid, 0);

    const today = asOfDate ? new Date(asOfDate) : new Date();

    // Determine due date & late fee if quarter specified
    let quarterInfo = null;
    let lateFee = 0;
    if (structure && quarterName) {
      quarterInfo = structure.quarters.find((q) => q.name === quarterName);
      if (quarterInfo && quarterInfo.dueDate && quarterInfo.lateFeePerDay > 0) {
        const diffMs = today - quarterInfo.dueDate;
        const daysLate = diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : 0;
        lateFee = daysLate * quarterInfo.lateFeePerDay;
      }
    }

    const finalDue = feeDue + lateFee;

    const schoolName = "Geetham Educational Institutions";
    const header = `${schoolName} - Fee Due Notice`;

    const studentLine = `${student.name} (${student.className}-${student.section}) Adm: ${student.admissionNo}`;
    const officeCopy = `
${header} [Office Copy]

Student: ${studentLine}
Academic Year: ${academicYear}
Quarter: ${quarterName || "Overall"}

Total Fee: ₹${totalFee.toFixed(2)}
Total Concession: ₹${totalConcession.toFixed(2)}
Net Payable: ₹${netPayable.toFixed(2)}
Total Paid: ₹${totalPaid.toFixed(2)}
Base Fee Due: ₹${feeDue.toFixed(2)}
Late Fee: ₹${lateFee.toFixed(2)}
------------------------------------
Total Amount Due: ₹${finalDue.toFixed(2)}

Generated On: ${today.toDateString()}
`;

    const studentCopy = `
${header} [Student Copy]

Dear Parent/Guardian,

This is to inform you that the following fee is pending for your ward:

${studentLine}
Academic Year: ${academicYear}
Quarter: ${quarterName || "Overall"}

Total Fee: ₹${totalFee.toFixed(2)}
Concession Granted: ₹${totalConcession.toFixed(2)}
Amount Paid: ₹${totalPaid.toFixed(2)}
Late Fee (if any): ₹${lateFee.toFixed(2)}

Total Amount Due: ₹${finalDue.toFixed(2)}

Kindly clear the dues at the earliest to avoid withholding of hall tickets and progress cards.

With regards,
Accounts Office
${schoolName}
`;

    res.json({
      status: "success",
      feeDue,
      lateFee,
      finalDue,
      officeCopy,
      studentCopy
    });
  } catch (error) {
    next(error);
  }
};

// ---------- 7. Bulk notify defaulters (email + WhatsApp stub) ----------
export const notifyDefaulters = async (req, res, next) => {
  try {
    const { academicYear, minDue = 1, scheduleAt = null } = req.body;

    // Very simple version: find all students, compute summary one by one
    const students = await Student.find({ isActive: true });

    const notified = [];

    for (const student of students) {
      const structure = await FeeStructure.findOne({
        academicYear,
        className: student.className,
        $or: [{ section: student.section }, { section: "ALL" }]
      }).sort({ section: -1 });

      if (!structure) continue;

      const totalFee = computeTotalFeeFromStructure(structure);
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

      const netPayable = Math.max(totalFee - totalConcession, 0);
      const feeDue = Math.max(netPayable - totalPaid, 0);

      if (feeDue < minDue) continue;

      const parentPhone = student.parentPhone;
      const parentEmail = null; // later: add email field to Student or Parent

      const message = `Geetham Fee Reminder: Your ward ${student.name} (${student.className}-${student.section}) has pending fee of ₹${feeDue.toFixed(
        2
      )} for AY ${academicYear}. Kindly pay at the earliest.`;

      if (parentPhone) {
        await sendWhatsApp(parentPhone, message, scheduleAt);
      }

      if (parentEmail) {
        await sendEmail(
          parentEmail,
          "Fee Due Reminder - Geetham",
          message.replace(/\n/g, "<br/>")
        );
      }

      notified.push({
        studentId: student._id,
        name: student.name,
        className: student.className,
        section: student.section,
        feeDue
      });
    }

    res.json({
      status: "success",
      notifiedCount: notified.length,
      notified
    });
  } catch (error) {
    next(error);
  }
};
