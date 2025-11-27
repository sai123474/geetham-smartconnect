
import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { analytics } = body;

    const prompt = `
You are an academic mentor at Geetham Educational Institutions.

We have exam analytics:

Class: ${analytics.className}-${analytics.section}
Exam: ${analytics.examName}
Academic Year: ${analytics.academicYear}
Class Average: ${analytics.classAveragePercentage.toFixed(2)}%

Subject analytics:
${analytics.subjectAnalytics
  .map(
    (s) =>
      `${s.subjectName}: avg=${s.avgPercentage.toFixed(
        2
      )}%, highest=${s.highestPercentage?.toFixed(
        2
      )}%, lowest=${s.lowestPercentage?.toFixed(2)}%`
  )
  .join("\n")}

Top 5 students (name, percentage):
${analytics.toppers
  .map((t) => `${t.studentName}: ${t.percentage.toFixed(2)}%`)
  .join("\n")}

Weak students (below 40%):
${analytics.weakStudents
  .map((w) => `${w.studentName}: ${w.percentage.toFixed(2)}%`)
  .join("\n")}

TASK:
1) In max 4 bullet points, give class-level feedback (where class is strong/weak).
2) List 3 practical suggestions for teachers to improve weak areas.
3) List 3 suggestions that can be told to parents & students (simple, motivating).

Return JSON:
{
  "classFeedback": ["...", "..."],
  "teacherActions": ["...", "..."],
  "parentSuggestions": ["...", "..."]
}
`;

    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        classFeedback: [text],
        teacherActions: [],
        parentSuggestions: []
      };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to generate performance insights" },
      { status: 500 }
    );
  }
}
