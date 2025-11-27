import { ENV } from "../config/env.js";

export const notFound = (req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Unhandled error:", err);

  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(ENV.NODE_ENV === "development" && { stack: err.stack })
  });
};
