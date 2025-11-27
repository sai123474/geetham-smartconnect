import { uploadToS3 } from "../utils/s3.js";
import { addJobToQueue } from "../workers/ocrQueue.js";

export const startOcrExtraction = async (req, res, next) => {
  try {
    const uploaded = await uploadToS3(
      req.file.buffer,
      `ocr-${Date.now()}-${req.file.originalname}`,
      req.file.mimetype,
      "ocr"
    );

    const job = await addJobToQueue({ fileUrl: uploaded.Location });

    res.json({
      status: "processing",
      jobId: job.id,
      message: "OCR started. You will find extracted results soon."
    });
  } catch (err) {
    next(err);
  }
};
