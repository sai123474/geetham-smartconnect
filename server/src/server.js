import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";

const createSuperAdminIfNotExists = async () => {
  const existing = await User.findOne({ role: "superadmin" });
  if (!existing) {
    const hash = await bcrypt.hash("geetham", 10);
    await User.create({
      name: "Sai",
      email: "yamparalasaikrishna6@gmail.com",
      phone: "7013833119",
      role: "superadmin",
      password: hash
    });
    console.log("Superadmin created: admin@geetham.edu | Admin@123");
  }
};

createSuperAdminIfNotExists();


const app = express();

// Connect to MongoDB
connectDB();

// Global middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan(ENV.NODE_ENV === "development" ? "dev" : "combined"));

// Base route
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Welcome to Geetham SmartConnect Backend"
  });
});

// API routes
app.use("/api", apiRoutes);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(ENV.PORT, () => {
  console.log(
    `🚀 Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`
  );
});
