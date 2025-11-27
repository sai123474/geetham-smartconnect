import mongoose from "mongoose";

const feeHeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tuition, Transport, Hostel, etc.
    amount: { type: Number, required: true },
    frequency: {
      type: String,
      enum: ["annual", "quarterly", "monthly", "one_time"],
      default: "annual"
    },
    isOptional: { type: Boolean, default: false }
  },
  { _id: false }
);

const quarterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["Q1", "Q2", "Q3", "Q4"],
      required: true
    },
    dueDate: { type: Date, required: true },
    lateFeePerDay: { type: Number, default: 0 }
  },
  { _id: false }
);

const feeStructureSchema = new mongoose.Schema(
  {
    academicYear: {
      type: String,
      required: true // e.g. "2025-26"
    },
    className: {
      type: String,
      required: true
    },
    section: {
      type: String,
      default: "ALL"
    },
    feeHeads: [feeHeadSchema],
    quarters: [quarterSchema],
    createdBy: {
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

feeStructureSchema.index(
  { academicYear: 1, className: 1, section: 1 },
  { unique: true }
);

export const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);
