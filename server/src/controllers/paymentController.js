import { AdmissionPayment } from "../models/AdmissionPayment.js";
import { Student } from "../models/Student.js";

export const createAdmissionPayment = async (req, res, next) => {
  try {
    const { amount, mode, reference, academicYear } = req.body;

    if (!amount || !academicYear) {
      return res.status(400).json({ status: "error", message: "Amount & academicYear required" });
    }

    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const payment = await AdmissionPayment.create({
      studentId: student._id,
      academicYear,
      amount,
      mode,
      reference,
      receivedBy: req.user._id
    });

    res.json({ status: "success", payment });
  } catch (err) {
    next(err);
  }
};
