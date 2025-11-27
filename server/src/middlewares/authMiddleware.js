// server/src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { LoginSession } from "../models/LoginSession.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Not logged in",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser || !currentUser.isActive) {
      return res.status(401).json({
        status: "error",
        message: "User no longer exists or is inactive",
      });
    }

    // check session
    if (decoded.sessionId) {
      const session = await LoginSession.findById(decoded.sessionId);
      if (!session || !session.isActive) {
        return res.status(401).json({
          status: "error",
          message: "This session has been logged out. Please login again.",
        });
      }
      session.lastActivityAt = new Date();
      await session.save();
      req.session = session;
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({
      status: "error",
      message: "Token invalid or expired",
    });
  }
};

export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to perform this action"
      });
    }
    next();
  };
};
