import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true // parent/teacher may log in with phone only
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    role: {
      type: String,
      enum: ["student", "parent", "teacher", "staff", "admin", "dean"],
      default: "student"
    },
    passwordHash: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model("User", userSchema);
