import { ApplicationForm } from "../models/ApplicationForm.js";
import { uploadToS3 } from "../utils/s3.js";

export const createApplicationForm = async (req, res, next) => {
  try {
    const {
      academicYear,
      name,
      gender,
      dob,
      classApplyingFor,
      parentName,
      phone,
      address,
      previousSchool,
      aadharNo
    } = req.body;

    // Validation
    if (
      !academicYear ||
      !name ||
      !dob ||
      !classApplyingFor ||
      !parentName ||
      !phone ||
      !address
    ) {
      return res.status(400).json({
        status: "error",
        message: "All required fields are not filled"
      });
    }

    // Prevent duplicate applications based on Aadhar
    const exists = await ApplicationForm.findOne({ aadharNo, academicYear });
    if (exists) {
      return res.status(409).json({
        status: "error",
        message: "Application already exists for this Aadhar number in this academic year"
      });
    }

    // Upload photo if attached
    let uploadedPhoto = null;
    if (req.file) {
      uploadedPhoto = await uploadToS3(
        req.file.buffer,
        `application_photo_${Date.now()}.${req.file.originalname.split(".").pop()}`,
        req.file.mimetype,
        `applicants/${academicYear}`
      );
    }

    // Generate formatted custom Application ID
    const count = await ApplicationForm.countDocuments({ academicYear });
    const applicationId = `GEETHAM-APP-${academicYear.replace("-", "")}-${(count + 1)
      .toString()
      .padStart(4, "0")}`;

    const form = await ApplicationForm.create({
      academicYear,
      applicationId,
      name,
      gender,
      dob,
      classApplyingFor,
      parentName,
      phone,
      address,
      previousSchool,
      aadharNo,
      photoUrl: uploadedPhoto?.Location || null,
      status: "pending"
    });

    res.status(201).json({
      status: "success",
      message: "Application submitted successfully",
      application: form
    });
  } catch (err) {
    console.error("Application Error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error while creating application",
      error: err.message
    });
  }
};
import PDFDocument from "pdfkit";

export const generateApplicationPdf = async (req, res, next) => {
  try {
    const form = await ApplicationForm.findById(req.params.id);
    if (!form) return res.status(404).json({ message: "Application not found" });

    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => {
      res.setHeader("Content-Type", "application/pdf");
      res.send(Buffer.concat(buffers));
    });

    doc.fontSize(18).text("Geetham Educational Institutions", { align: "center" });
    doc.moveDown(1);
    doc.fontSize(16).text("Admission Application Form", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(12).text(`Academic Year: ${form.academicYear}`);
    doc.text(`Student Name: ${form.name}`);
    doc.text(`Gender: ${form.gender}`);
    doc.text(`DOB: ${new Date(form.dob).toDateString()}`);
    doc.text(`Class Applying For: ${form.classApplyingFor}`);
    doc.text(`Parent Name: ${form.parentName}`);
    doc.text(`Phone: ${form.phone}`);
    doc.text(`Address: ${form.address}`);
    doc.text(`Previous School: ${form.previousSchool}`);
    doc.text(`Aadhar: ${form.aadharNo}`);

    doc.end();
  } catch (err) {
    next(err);
  }
};
