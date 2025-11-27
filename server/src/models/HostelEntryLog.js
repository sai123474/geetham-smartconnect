import mongoose from "mongoose";

const hostelEntryLogSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    direction: {
      type: String,
      enum: ["out", "in"],
      required: true
    },
    leaveRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveRequest"
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    scannedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export const HostelEntryLog = mongoose.model(
  "HostelEntryLog",
  hostelEntryLogSchema
);
