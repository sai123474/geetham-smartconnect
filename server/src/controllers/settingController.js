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
export const uploadSignature = async (req, res, next) => {
  try {
    const { role } = req.params;
    if (!["principal", "dean", "teacher"].includes(role)) {
      return res.status(400).json({ message: "Invalid signature role" });
    }

    const file = req.file;
    if (!file) return res.status(400).json({ message: "Signature image required" });

    const uploaded = await uploadToS3(
      file.buffer,
      `signature_${role}.png`,
      file.mimetype,
      "signatures"
    );

    await Setting.findOneAndUpdate(
      { key: `${role}Signature` },
      { value: uploaded.Location },
      { upsert: true }
    );

    res.json({
      status: "success",
      signatureUrl: uploaded.Location
    });
  } catch (err) {
    next(err);
  }
};

