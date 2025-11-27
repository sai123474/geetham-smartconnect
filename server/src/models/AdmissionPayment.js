import mongoose from "mongoose";

const admissionPaymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    academicYear: { type: String, required: true },
    amount: { type: Number, required: true },
    mode: { type: String, enum: ["cash", "card", "upi"], default: "cash" },
    reference: { type: String },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const AdmissionPayment = mongoose.model(
  "AdmissionPayment",
  admissionPaymentSchema
);
