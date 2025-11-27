import { LeaveRequest } from "../models/LeaveRequest.js";
import { Setting } from "../models/Setting.js";
import { uploadToS3 } from "../utils/s3.js";
import PDFDocument from "pdfkit";

export const createLeaveRequest = async (req, res, next) => {
  try {
    const { fromDate, toDate, reason, parentPhone } = req.body;
    const studentId = req.user._id;

    const request = await LeaveRequest.create({
      studentId,
      fromDate,
      toDate,
      reason,
      parentPhone,
    });

    res.json({ status: "success", request });
  } catch (err) {
    next(err);
  }
};

export const generateLeavePdf = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await LeaveRequest.findById(id).populate("studentId");
    if (!leave) return res.status(404).json({ message: "Leave request not found" });

    const schoolInfo = await Setting.findOne({ key: "collegeLogo" });

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
    if (schoolInfo?.value) {
      try {
        const img = await fetch(schoolInfo.value).then((r) => r.arrayBuffer());
        doc.image(Buffer.from(img), 40, 30, { width: 70 });
      } catch {}
    }

    doc.fontSize(18).text("Geetham Educational Institutions", 130, 45);
    doc.moveDown(2);

    // Title
    doc.fontSize(16).text("HOSTEL LEAVE UNDERTAKING", { align: "center" });
    doc.moveDown(1);

    doc.fontSize(12).text(`Student Name: ${leave.studentId.name}`);
    doc.text(`Admission No: ${leave.studentId.admissionNo}`);
    doc.text(`Class & Section: ${leave.studentId.className}-${leave.studentId.section}`);
    doc.text(`Leave Dates: ${leave.fromDate.toDateString()} - ${leave.toDate.toDateString()}`);
    doc.moveDown(1);

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
