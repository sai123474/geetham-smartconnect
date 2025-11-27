import fetch from "node-fetch";

export const processMarksOCR = async ({ fileUrl }) => {
  const key = process.env.GEMINI_API_KEY;

  const body = {
    contents: [
      {
        parts: [
          {
            text:
              "Extract student roll number, name, subject marks and totals in JSON format."
          },
          {
            image: { url: fileUrl }
          }
        ]
      }
    ]
  };

  const resp = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" +
      key,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  const data = await resp.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return { rawText: raw };
  }
};
