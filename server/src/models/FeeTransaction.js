import mongoose from "mongoose";

const feeTransactionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    academicYear: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    mode: {
      type: String,
      enum: ["cash", "cheque", "online_manual_entry"],
      default: "cash"
    },
    receiptNo: {
      type: String,
      required: true,
      unique: true
    },
    quarter: {
      type: String,
      enum: ["Q1", "Q2", "Q3", "Q4", "FULL", "OTHER"],
      default: "OTHER"
    },
    feeHeads: [String], // which heads this payment covers
    remarks: String,
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export const FeeTransaction = mongoose.model(
  "FeeTransaction",
  feeTransactionSchema
);
