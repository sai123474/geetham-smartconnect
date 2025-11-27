import { ApplicationForm } from "../models/ApplicationForm.js";
import { uploadToS3 } from "../utils/s3.js";

export const createApplicationForm = async (req, res, next) => {
  try {
    const { academicYear, name, gender, dob, classApplyingFor, parentName, phone, address, previousSchool, aadharNo } = req.body;

    const photo = req.file
      ? await uploadToS3(req.file.buffer, `applicant_${Date.now()}.jpg`, req.file.mimetype, "applicants")
      : null;

    const form = await ApplicationForm.create({
      academicYear,
      name,
      gender,
      dob,
      classApplyingFor,
      parentName,
      phone,
      address,
      previousSchool,
      aadharNo,
      photoUrl: photo?.Location || null
    });

    res.json({ status: "success", form });
  } catch (err) {
    next(err);
  }
};
