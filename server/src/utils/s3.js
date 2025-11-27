import AWS from "aws-sdk";
import { ENV } from "../config/env.js";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export const uploadToS3 = (fileBuffer, filename, mimeType, folder = "complaints") => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${folder}/${Date.now()}_${filename}`,
    Body: fileBuffer,
    ContentType: mimeType
  };

  return s3.upload(params).promise();
};
