import { AuditLog } from "../models/AuditLog.js";

export const logAction = async (req, action, module, meta = {}) => {
  await AuditLog.create({
    user: req.user?._id,
    action,
    module,
    meta,
    ip: req.ip
  });
};
