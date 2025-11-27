import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    fromDate: {
      type: Date,
      required: true
    },
    toDate: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    parentPhone: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    rejectedReason: {
      type: String
    },

    feeDueAtRequest: {
      type: Number,
      default: 0
    },
    feeBlocked: {
      // if true, leave cannot be auto-approved until fee cleared
      type: Boolean,
      default: false
    },

    pdfUrl: {
      type: String
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    approvedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export const LeaveRequest = mongoose.model("LeaveRequest", leaveSchema);
