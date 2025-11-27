import mongoose from "mongoose";

const complaintCommentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    internal: {
      type: Boolean,
      default: false // internal note visible only to staff/admin/principal
    }
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    url: String,
    fileName: String,
    fileType: String
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: [
        "academic",
        "discipline",
        "hostel",
        "transport",
        "mess",
        "fees",
        "infrastructure",
        "safety",
        "other"
      ],
      default: "other"
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "critical"],
      default: "normal"
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "escalated", "resolved", "closed", "rejected"],
      default: "open"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reporterRole: {
      type: String,
      enum: ["student", "parent", "teacher", "staff"],
      required: true
    },
    studentId: {
      // optional: student the complaint is about
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    },
    assignedTo: {
      // primary handler – staff/teacher/warden
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    escalatedTo: {
      // principal/dean/admin
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    targetRole: {
      // routing hint for UI
      type: String,
      enum: ["teacher", "warden", "principal", "dean", "admin", "counsellor", "management"],
      default: "teacher"
    },
    attachments: [attachmentSchema],
    comments: [complaintCommentSchema],
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const Complaint = mongoose.model("Complaint", complaintSchema);
