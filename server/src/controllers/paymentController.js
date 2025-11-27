import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fetch from "node-fetch";
import { AdmissionPayment } from "../models/AdmissionPayment.js";
import { Setting } from "../models/Setting.js";
import { uploadToS3 } from "../utils/s3.js";
import { Student } from "../models/Student.js";

export const createAdmissionPayment = async (req, res, next) => {
  try {
    const { studentId, academicYear, amount, mode, reference } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ status: "error", message: "Student not found" });
    }

    const payment = await AdmissionPayment.create({
      studentId,
      academicYear,
      amount,
      mode,
      reference
    });

    res.json({
      status: "success",
      payment
    });
  } catch (err) {
    next(err);
  }
};

export const generatePaymentReceiptPdf = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await AdmissionPayment.findById(paymentId).populate("studentId");
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    const student = payment.studentId;
    const logoSetting = await Setting.findOne({ key: "collegeLogo" });
    const signSetting = await Setting.findOne({ key: "principalSignature" });

    // Auto Receipt Number Format: REC-2025-00001
    const receiptNumber = `REC-${payment.createdAt.getFullYear()}-${String(payment._id).slice(-5)}`;

    // QR Code
    const verifyUrl = `https://geetham.edu.in/verify/receipt/${paymentId}`;
    const qrBuffer = await QRCode.toBuffer(verifyUrl);

    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      // Upload PDF to S3
      const uploaded = await uploadToS3(
        pdfBuffer,
        `receipts/receipt_${receiptNumber}.pdf`,
        "application/pdf",
        `receipts/${payment.academicYear}`
      );

      payment.receiptUrl = uploaded.Location;
      await payment.save();

      res.json({ status: "success", pdfUrl: uploaded.Location });
    });

    // HEADER
    if (logoSetting?.value) {
      const logoImg = await fetch(logoSetting.value).then((r) => r.arrayBuffer());
      doc.image(Buffer.from(logoImg), 40, 30, { width: 70 });
    }

    doc.fontSize(18).text("GEETHAM EDUCATIONAL INSTITUTIONS", 130, 45);
    doc.moveDown(2);

    doc.fontSize(16).text("ADMISSION PAYMENT RECEIPT", { align: "center" });
    doc.moveDown(1);

    // RECEIPT INFO
    doc.fontSize(11).text(`Receipt No: ${receiptNumber}`);
    doc.text(`Verify: ${verifyUrl}`, { link: verifyUrl, underline: true });
    doc.moveDown(1);

    // STUDENT INFO
    doc.fontSize(12).text(`Student Name: ${student.name}`);
    doc.text(`Admission No: ${student.admissionNo}`);
    doc.text(`Class: ${student.className}`);
    doc.text(`Academic Year: ${payment.academicYear}`);
    doc.moveDown(1);

    // PAYMENT INFO
    doc.fontSize(12).text(`Payment Amount: ₹ ${payment.amount.toFixed(2)}`);
    doc.text(`Mode of Payment: ${payment.mode}`);
    doc.text(`Reference No: ${payment.reference || "N/A"}`);
    doc.text(`Transaction Date: ${payment.createdAt.toDateString()}`);

    // QR + SIGNATURE
    doc.image(qrBuffer, 420, 300, { width: 100 });

    if (signSetting?.value) {
      const signImg = await fetch(signSetting.value).then((r) => r.arrayBuffer());
      doc.image(Buffer.from(signImg), 50, 350, { width: 120 });
    }

    doc.moveDown(6);
    doc.text("Principal Signature", 60);
    doc.text("Accounts Dept Signature", 390);

    // FOOTER
    doc.moveDown(2);
    doc.fontSize(10).fillColor("#555").text(
      "Note: This is a system-generated receipt. No physical signature required.",
      { align: "center" }
    );

    doc.end();
  } catch (err) {
    next(err);
  }
};
