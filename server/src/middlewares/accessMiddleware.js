import { Permission } from "../models/Permission.js";

export const checkPermission = (permissionKey) => {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ status: "error", message: "Not logged in" });

    const perm = await Permission.findOne({ role: req.user.role });

    if (!perm || perm.permissions.get(permissionKey) !== true) {
      return res.status(403).json({
        status: "error",
        message: `Permission denied for role '${req.user.role}'`
      });
    }

    next();
  };
};
