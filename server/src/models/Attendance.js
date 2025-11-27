import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    className: {
      type: String,
      required: true
    },
    section: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    period: {
      type: String,
      default: "full-day" // 1,2,3 or full-day
    },
    status: {
      type: String,
      enum: ["present", "absent", "leave"],
      required: true
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    source: {
      type: String,
      enum: ["manual", "excel", "ocr"],
      default: "manual"
    }
  },
  { timestamps: true }
);

attendanceSchema.index({ studentId: 1, date: 1, period: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
