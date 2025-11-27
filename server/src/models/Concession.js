import mongoose from "mongoose";

const concessionSchema = new mongoose.Schema(
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
    type: {
      type: String, // e.g. "Management", "Sibling", "Staff Child", "Merit"
      required: true
    },
    amount: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0 // if used instead of amount
    },
    reason: String,
    approvedBy: {
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

export const Concession = mongoose.model("Concession", concessionSchema);
