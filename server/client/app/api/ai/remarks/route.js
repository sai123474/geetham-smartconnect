import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Very simple text-only call to Gemini 1.5 Pro
export async function POST(req) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try:
    const body = await req.json();
    const { examName, academicYear, className, section, subjects } = body;

    const subjectSummary = subjects
      .map((s) => `${s.subjectName}: ${s.obtainedMarks}/${s.maxMarks}`)
      .join(", ");

    const prompt = `
You are a school teacher in Geetham Educational Institutions.

Exam: ${examName}
Academic Year: ${academicYear}
Class: ${className}-${section}

Student subject performance:
${subjectSummary}

Write:
1) A short, encouraging class-teacher remark (2–3 lines, positive but honest).
2) A principal remark (1–2 lines, formal).

Return JSON with keys:
{
  "teacherRemark": "...",
  "principalRemark": "..."
}
`;

    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await resp.json();

    // Extract text from Gemini response
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    let teacherRemark = "";
    let principalRemark = "";

    try {
      // Try parsing JSON if Gemini responded with it directly
      const parsed = JSON.parse(text);
      teacherRemark = parsed.teacherRemark || "";
      principalRemark = parsed.principalRemark || "";
    } catch {
      // Fallback: simple splitting heuristic
      const pieces = text.split("\n").filter((l) => l.trim());
      teacherRemark = pieces.slice(0, 2).join(" ");
      principalRemark = pieces.slice(2).join(" ");
    }

    return NextResponse.json({
      teacherRemark,
      principalRemark,
    });
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json(
      { error: "Failed to generate remarks" },
      { status: 500 }
    );
  }
}
