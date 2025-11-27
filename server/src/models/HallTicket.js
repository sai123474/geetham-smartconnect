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
    attendancePercentage: {
      type: Number,
      default: 0
    },
    feeDue: {
      type: Number,
      default: 0
    },
    eligible: {
      type: Boolean,
      default: false
    },
    approvedByAdmin: {
      type: Boolean,
      default: false
    },
    approvedByDean: {
      type: Boolean,
      default: false
    },
    remarks: String,
    generatedPdfUrl: String
  },
  { timestamps: true }
);

export const HallTicket = mongoose.model("HallTicket", hallTicketSchema);
