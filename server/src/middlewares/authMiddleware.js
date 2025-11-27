import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-passwordHash");

    next();
  } catch (error) {
    console.error("JWT Error:", error);
    res.status(401).json({ message: "Token failed or expired" });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions" });
    }
    next();
  };
};
