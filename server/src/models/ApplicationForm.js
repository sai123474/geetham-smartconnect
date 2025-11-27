import mongoose from "mongoose";

const applicationFormSchema = new mongoose.Schema(
  {
    academicYear: { type: String, required: true },
    name: { type: String, required: true },
    gender: String,
    dob: Date,
    classApplyingFor: String,
    parentName: String,
    phone: String,
    address: String,
    previousSchool: String,
    aadharNo: String,
    photoUrl: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export const ApplicationForm = mongoose.model(
  "ApplicationForm",
  applicationFormSchema
);
