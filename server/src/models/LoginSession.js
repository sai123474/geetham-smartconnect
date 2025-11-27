// server/src/models/LoginSession.js
import mongoose from "mongoose";

const loginSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userAgent: { type: String },
    deviceName: { type: String }, // optional interpretation of UA
    ip: { type: String },
    isActive: { type: Boolean, default: true },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const LoginSession = mongoose.model("LoginSession", loginSessionSchema);
