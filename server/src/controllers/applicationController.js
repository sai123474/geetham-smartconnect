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
    const verificationUrl = `https://geetham.edu.in/verify/application/${id}`;
    const qrBuffer = await QRCode.toBuffer(verificationUrl);

    const doc = new PDFDocument({ margin: 40 });
    let buffers = [];

    // Collect PDF chunks
    const pdfReady = new Promise((resolve) => {
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
    });

    // Render logo
    if (logoSetting?.value) {
      try {
        const img = await fetch(logoSetting.value).then((r) => r.arrayBuffer());
        doc.image(Buffer.from(img), 40, 32, { width: 70 });
      } catch {}
    }

    // Header
    doc.fontSize(20).text("GEETHAM EDUCATIONAL INSTITUTIONS", 130, 40);
    doc.moveDown(2);
    doc.fontSize(18).text("ADMISSION APPLICATION FORM", { align: "center" }).moveDown(1);

    // Student Photo
    if (form.photoUrl) {
      try {
        const photo = await fetch(form.photoUrl).then((r) => r.arrayBuffer());
        doc.image(Buffer.from(photo), 420, 115, { fit: [120, 140], align: "right" });
      } catch {}
    }

    doc.image(qrBuffer, 440, 300, { width: 100 });

    doc.fontSize(12)
      .text(`Application ID: ${form.applicationId}`)
      .text(`Academic Year: ${form.academicYear}`)
      .text(`Verified URL: ${verificationUrl}`, { link: verificationUrl, underline: true })
      .moveDown(1)
      .text(`Student Name: ${form.name}`)
      .text(`Gender: ${form.gender || "Not provided"}`)
      .text(`DOB: ${new Date(form.dob).toDateString()}`)
      .text(`Class Applying For: ${form.classApplyingFor}`)
      .text(`Parent Name: ${form.parentName}`)
      .text(`Phone: ${form.phone}`)
      .text(`Address: ${form.address}`)
      .text(`Previous School: ${form.previousSchool || "Not provided"}`)
      .text(`Aadhar: ${form.aadharNo}`)
      .moveDown(3)
      .text("Parent Signature: _______________________________", 50)
      .moveDown(2)
      .text("Admin / Principal Signature: _______________________", 50);

    doc.end();

    // Wait for PDF to finish building
    const pdfBuffer = await pdfReady;

    const uploaded = await uploadToS3(
      pdfBuffer,
      `admissions/admission_${form.applicationId}_${Date.now()}.pdf`,
      "application/pdf",
      `admissions/${form.academicYear}`
    );

    form.applicationPdfUrl = uploaded.Location;
    await form.save();

    return res.json({ status: "success", url: uploaded.Location });

  } catch (err) {
    next(err);
  }
};
