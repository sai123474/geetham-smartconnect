import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true
    },
    permissions: {
      type: Map,
      of: Boolean,
      default: {}
    }
  },
  { timestamps: true }
);

export const Permission = mongoose.model("Permission", permissionSchema);
