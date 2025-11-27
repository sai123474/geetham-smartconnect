import Queue from "bull";
import { processMarksOCR } from "./processOcr.js";

export const ocrQueue = new Queue("ocrQueue", process.env.REDIS_URL);

ocrQueue.process(async (job) => {
  return await processMarksOCR(job.data);
});

export const addJobToQueue = async (data) => {
  return await ocrQueue.add(data);
};
