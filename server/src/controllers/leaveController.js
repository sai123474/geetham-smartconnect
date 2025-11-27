import { LeaveRequest } from "../models/LeaveRequest.js";
import { Student } from "../models/Student.js";
import { FeeStructure } from "../models/FeeStructure.js";
import { Concession } from "../models/Concession.js";
import { FeeTransaction } from "../models/FeeTransaction.js";
import { Setting } from "../models/Setting.js";
import { uploadToS3 } from "../utils/s3.js";
import { sendWhatsApp, sendEmail, sendSMS } from "../utils/notification.js";
import PDFDocument from "pdfkit";

// helper: compute full-year fee due (same logic family as progress)
const computeFeeDueForStudent = async (student, academicYear) => {
  const structure = await FeeStructure.findOne({
    academicYear,
    className: student.className,
    $or: [{ section: student.section }, { section: "ALL" }]
  }).sort({ section: -1 });

  if (!structure) return 0;

  const totalFee = structure.feeHeads.reduce(
    (sum, h) => sum + (h.amount || 0),
    0
  );

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

  return Math.max(totalFee - totalConcession - totalPaid, 0);
};

// STUDENT: create leave request
export const createLeaveRequest = async (req, res, next) => {
  try {
    const { fromDate, toDate, reason, parentPhone, academicYear } = req.body;

    if (!fromDate || !toDate || !reason || !parentPhone || !academicYear) {
      return res.status(400).json({
        message: "fromDate, toDate, reason, parentPhone, academicYear required"
      });
    }

    // req.user is the logged in student user
    const student = await Student.findOne({ _id: req.user._id });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const feeDue = await computeFeeDueForStudent(student, academicYear);
    const feeBlocked = feeDue > 0; // adjust rule if needed

    const request = await LeaveRequest.create({
      studentId: student._id,
      fromDate,
      toDate,
      reason,
      parentPhone,
      feeDueAtRequest: feeDue,
      feeBlocked
    });

    res.json({
      status: "success",
      request,
      warning:
        feeBlocked &&
        `Leave is fee-blocked. Fee due: ₹${feeDue.toFixed(
          2
        )}. Warden/Principal may reject until dues cleared.`
    });
  } catch (err) {
    next(err);
  }
};

// WARDEN/ADMIN: list pending leave requests
export const listLeaveRequests = async (req, res, next) => {
  try {
    const { status = "pending" } = req.query;

    const leaves = await LeaveRequest.find({ status })
      .populate("studentId", "name className section admissionNo")
      .sort({ createdAt: -1 });

    res.json({
      status: "success",
      leaves
    });
  } catch (err) {
    next(err);
  }
};

// WARDEN/ADMIN: approve or reject
export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, rejectedReason } = req.body; // action: "approve" or "reject"

    const leave = await LeaveRequest.findById(id).populate(
      "studentId",
      "name className section admissionNo"
    );
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    if (action === "approve") {
      // simple rule: if feeBlocked, you may still allow but you know feeDue
      leave.status = "approved";
      leave.approvedBy = req.user._id;
      leave.approvedAt = new Date();
      leave.rejectedReason = null;

      await leave.save();

      // Notifications to parent (WhatsApp + SMS/email stub)
      const msg = `Geetham Hostel: Leave approved for ${leave.studentId.name} (${leave.studentId.className}-${leave.studentId.section}) from ${leave.fromDate.toDateString()} to ${leave.toDate.toDateString()}.`;
      await sendWhatsApp(leave.parentPhone, msg);
      await sendSMS(leave.parentPhone, msg);

      return res.json({ status: "success", leave });
    }

    if (action === "reject") {
      leave.status = "rejected";
      leave.rejectedReason = rejectedReason || "Not specified";
      leave.approvedBy = req.user._id;
      leave.approvedAt = new Date();

      await leave.save();

      const msg = `Geetham Hostel: Leave request for ${leave.studentId.name} was REJECTED. Reason: ${leave.rejectedReason}`;
      await sendWhatsApp(leave.parentPhone, msg);
      await sendSMS(leave.parentPhone, msg);

      return res.json({ status: "success", leave });
    }

    return res.status(400).json({ message: "Invalid action" });
  } catch (err) {
    next(err);
  }
};

// Generate PDF as before (same as earlier, can reuse your existing generateLeavePdf)
export const generateLeavePdf = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await LeaveRequest.findById(id).populate("studentId");
    if (!leave) return res.status(404).json({ message: "Leave request not found" });

    const logoSetting = await Setting.findOne({ key: "collegeLogo" });

    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", async () => {
      const pdf = Buffer.concat(buffers);

      const uploaded = await uploadToS3(
        pdf,
        `leave_${leave.studentId.admissionNo}_${Date.now()}.pdf`,
        "application/pdf",
        "leave-letters"
      );

      leave.pdfUrl = uploaded.Location;
      await leave.save();

      res.json({ status: "success", pdfUrl: uploaded.Location });
    });

    // Header
    if (logoSetting?.value) {
      try {
        const img = await fetch(logoSetting.value).then((r) => r.arrayBuffer());
        doc.image(Buffer.from(img), 40, 30, { width: 70 });
      } catch {}
    }

    doc.fontSize(18).text("Geetham Educational Institutions", 130, 45);
    doc.moveDown(2);

    doc.fontSize(16).text("HOSTEL LEAVE UNDERTAKING", { align: "center" });
    doc.moveDown(1);

    doc.fontSize(12).text(`Student Name: ${leave.studentId.name}`);
    doc.text(`Admission No: ${leave.studentId.admissionNo}`);
    doc.text(
      `Class & Section: ${leave.studentId.className}-${leave.studentId.section}`
    );
    doc.text(
      `Leave Dates: ${leave.fromDate.toDateString()} - ${leave.toDate.toDateString()}`
    );
    doc.moveDown(1);

    if (leave.feeDueAtRequest > 0) {
      doc
        .fillColor("red")
        .text(
          `Note: Fee due at time of request: ₹${leave.feeDueAtRequest.toFixed(2)}`,
          { underline: true }
        );
      doc.fillColor("black");
      doc.moveDown(0.5);
    }

    doc.text("Undertaking:", { underline: true });
    doc.moveDown(0.5);
    doc.text(
      `I hereby request permission to leave hostel for the above-mentioned period. `
        + `I take complete responsibility for my safety and discipline outside the college campus. `
        + `My parents/guardian are aware and approve this leave.`
    );
    doc.moveDown(1);

    doc.text(`Reason: ${leave.reason}`);
    doc.text(`Parent/Guardian Contact: ${leave.parentPhone}`);
    doc.moveDown(3);

    doc.text("Parent Signature: ___________________", 50);
    doc.text("Warden Signature: ___________________", 350);

    doc.end();
  } catch (err) {
    next(err);
  }
};
