import mongoose from "mongoose";

const hallTicketSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    examName: {
      type: String,
      required: true
    },
    quarter: {
      type: String,
      enum: ["Q1", "Q2", "Q3", "Q4", "FINAL"],
      required: true
    },
    attendancePercentage: Number,
    feeDue: Number,
    eligible: Boolean,
    denialReason: String,
    approvedByAdmin: {
      type: Boolean,
      default: false
    },
    approvedByDean: {
      type: Boolean,
      default: false
    },
    generatedPdfUrl: String
  },
  { timestamps: true }
);

export const HallTicket = mongoose.model("HallTicket", hallTicketSchema);
  { timestamps: true }
);

export const HallTicket = mongoose.model("HallTicket", hallTicketSchema);
