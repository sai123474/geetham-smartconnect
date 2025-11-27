import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  module: { type: String, required: true },
  meta: { type: Object, default: {} },
  ip: String
}, { timestamps: true });

export const AuditLog = mongoose.model("AuditLog", auditSchema);
