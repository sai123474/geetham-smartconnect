import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const runGeminiText = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const runGeminiOCR = async (buffer) => {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_OCR_MODEL || "gemini-1.5-pro"
  });

  const result = await model.generateContent([
    {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: "image/png"
      }
    },
    "Extract all text and table structures clearly."
  ]);

  return result.response.text();
};
