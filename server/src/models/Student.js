import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    admissionNo: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    rollNo: {
      type: Number
    },
    className: {
      // e.g. "8", "9", "10", "Inter 1st Year"
      type: String,
      required: true,
      trim: true
    },
    section: {
      // e.g. "A", "B", "C"
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male"
    },
    dob: {
      type: Date
    },
    parentName: {
      type: String,
      trim: true
    },
    parentPhone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      // Which staff/admin created this record
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

export const Student = mongoose.model("Student", studentSchema);
