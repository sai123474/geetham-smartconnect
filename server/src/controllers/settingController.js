import { Setting } from "../models/Setting.js";
import { uploadToS3 } from "../utils/s3.js";

export const uploadLogo = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "Logo file is required" });

    const uploaded = await uploadToS3(
      file.buffer,
      "college_logo.png",
      file.mimetype,
      "assets"
    );

    await Setting.findOneAndUpdate(
      { key: "collegeLogo" },
      { value: uploaded.Location },
      { upsert: true }
    );

    res.json({
      status: "success",
      logoUrl: uploaded.Location
    });
  } catch (err) {
    next(err);
  }
};

export const getLogo = async (req, res, next) => {
  try {
    const setting = await Setting.findOne({ key: "collegeLogo" });
    res.json({
      status: "success",
      logoUrl: setting?.value || null
    });
  } catch (err) {
    next(err);
  }
};
