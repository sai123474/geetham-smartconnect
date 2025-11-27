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
    academicYear: {
      type: String,
      required: true
    },
    subjects: [
  {
    name: String,
    examDate: Date,
    startTime: String,
    endTime: String
  }
],

    quarter: {
      type: String,
      enum: ["Q1", "Q2", "Q3", "Q4", "FINAL"],
      required: true
    },

    hallTicketNumber: {
      type: String,
      unique: true,
      sparse: true
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

    approvedByAdminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    approvedByDeanUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    generatedPdfUrl: String
  },
  { timestamps: true }
);

export const HallTicket = mongoose.model("HallTicket", hallTicketSchema);
