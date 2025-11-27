import PDFDocument from "pdfkit";
import fetch from "node-fetch";
import { uploadToS3 } from "../utils/s3.js";
import { Setting } from "../models/Setting.js";
import QRCode from "qrcode";
import { ApplicationForm } from "../models/ApplicationForm.js";

export const generateApplicationPdf = async (req, res, next) => {
  try {
    const { id } = req.params;

    const form = await ApplicationForm.findById(id);
    if (!form) return res.status(404).json({ status: "error", message: "Application not found" });

    const logoSetting = await Setting.findOne({ key: "collegeLogo" });

    // Generate QR code for verification page
    const verificationUrl = `https://geetham.edu.in/verify/application/${id}`;
    const qrBuffer = await QRCode.toBuffer(verificationUrl);

    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      // Upload PDF to S3
      const uploaded = await uploadToS3(
        pdfBuffer,
        `admissions/admission_${form.applicationId}_${Date.now()}.pdf`,
        "application/pdf",
        `admissions/${form.academicYear}`
      );

      form.applicationPdfUrl = uploaded.Location;
      await form.save();

      res.json({
        status: "success",
        url: uploaded.Location
      });
    });

    // Header with logo
    if (logoSetting?.value) {
      try {
        const img = await fetch(logoSetting.value).then((r) => r.arrayBuffer());
        doc.image(Buffer.from(img), 40, 32, { width: 70 });
      } catch (err) {}
    }

    doc.fontSize(20).text("GEETHAM EDUCATIONAL INSTITUTIONS", 130, 40, {
      align: "left"
    });

    doc.moveDown(2);
    doc.fontSize(18).text("ADMISSION APPLICATION FORM", { align: "center" });
    doc.moveDown(1);

    // Student Photo
    if (form.photoUrl) {
      try {
        const photoBuffer = await fetch(form.photoUrl).then((r) => r.arrayBuffer());
        doc.image(Buffer.from(photoBuffer), 420, 115, { fit: [120, 140], align: "right" });
      } catch {}
    }

    // QR Code
    doc.image(qrBuffer, 440, 300, { width: 100 });

    doc.moveDown(1);

    doc.fontSize(12).text(`Application ID: ${form.applicationId}`);
    doc.text(`Academic Year: ${form.academicYear}`);
    doc.text(`Verified URL: ${verificationUrl}`, { link: verificationUrl, underline: true });
    doc.moveDown(1);

    doc.text(`Student Name: ${form.name}`);
    doc.text(`Gender: ${form.gender || "Not provided"}`);
    doc.text(`DOB: ${new Date(form.dob).toDateString()}`);
    doc.text(`Class Applying For: ${form.classApplyingFor}`);
    doc.text(`Parent Name: ${form.parentName}`);
    doc.text(`Phone: ${form.phone}`);
    doc.text(`Address: ${form.address}`);
    doc.text(`Previous School: ${form.previousSchool || "Not provided"}`);
    doc.text(`Aadhar: ${form.aadharNo}`);

    doc.moveDown(3);

    doc.text("Parent Signature: _______________________________", 50);
    doc.moveDown(2);
    doc.text("Admin / Principal Signature: _______________________", 50);

    doc.end();
  } catch (err) {
    next(err);
  }
};
