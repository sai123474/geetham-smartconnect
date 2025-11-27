import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true },
    parentPhone: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    pdfUrl: { type: String }
  },
  { timestamps: true }
);

export const LeaveRequest = mongoose.model("LeaveRequest", leaveSchema);
