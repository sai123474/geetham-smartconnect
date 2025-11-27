import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || "change-me"
};

if (!ENV.MONGO_URI) {
  console.warn("⚠️  MONGO_URI is not set in environment variables.");
}
