import { Permission } from "../models/Permission.js";

export const getPermissionsMatrix = async (req, res, next) => {
  try {
    const perms = await Permission.find().lean();
    res.json({
      status: "success",
      permissions: perms.map(p => ({
        role: p.role,
        permissions: Object.fromEntries(p.permissions || [])
      }))
    });
  } catch (err) {
    next(err);
  }
};

export const updatePermissionsMatrix = async (req, res, next) => {
  try {
    const { matrix } = req.body;
    if (!Array.isArray(matrix)) {
      return res.status(400).json({ status: "error", message: "Matrix must be array" });
    }

    for (const row of matrix) {
      await Permission.findOneAndUpdate(
        { role: row.role },
        { permissions: row.permissions || {} },
        { upsert: true, new: true }
      );
    }

    res.json({ status: "success", message: "Permissions updated" });
  } catch (err) {
    next(err);
  }
};
