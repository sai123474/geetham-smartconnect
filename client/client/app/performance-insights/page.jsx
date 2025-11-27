"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function PerformanceInsights() {
  const [academicYear, setAcademicYear] = useState("2025-26");
  const [examName, setExamName] = useState("SA1");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const fetchAnalytics = async () => {
    if (!academicYear || !examName || !className) {
      alert("Please fill Academic Year, Exam, Class");
      return;
    }
    try {
      setLoading(true);
      const params = new URLSearchParams({
        academicYear,
        examName,
        className
      });
      if (section) params.append("section", section);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/analytics/class-exam?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.status === "success") {
        setAnalytics(data.analytics);
        setAiResult(null);
      } else {
        alert(data.message || "No analytics available");
      }
    } catch (err) {
      console.error(err);
      alert("Error loading analytics");
    } finally {
      setLoading(false);
    }
  };

  const runAiInsights = async () => {
    if (!analytics) {
      alert("Load analytics first");
      return;
    }
    try {
      setAiLoading(true);
      const res = await fetch("/api/ai/performance-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analytics })
      });
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      console.error(err);
      alert("Error generating AI suggestions");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Class Performance Analytics & AI Suggestions
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 text-sm">
        <input
          className="border p-2 rounded-md"
          placeholder="Academic Year"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
        />
        <input
          className="border p-2 rounded-md"
          placeholder="Exam Name"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
        />
        <input
          className="border p-2 rounded-md"
          placeholder="Class (e.g., 10)"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />
        <input
          className="border p-2 rounded-md"
          placeholder="Section (optional)"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        />
        <button
          onClick={fetchAnalytics}
          className="bg-blue-600 text-white rounded-md text-sm px-4 py-2"
          disabled={loading}
        >
          {loading ? "Loading..." : "Load Analytics"}
        </button>
      </div>

      {analytics && (
        <>
          <div className="mb-4 border rounded-xl p-4 bg-white shadow-sm">
            <h2 className="font-semibold mb-2">
              Summary – {analytics.className}-{analytics.section} ({analytics.examName})
            </h2>
            <p className="text-sm text-gray-700">
              Class Average:{" "}
              <b>{analytics.classAveragePercentage.toFixed(2)}%</b> · Students:{" "}
              <b>{analytics.studentCount}</b>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="border rounded-xl p-4 bg-white shadow-sm">
              <h3 className="font-semibold mb-2 text-sm">Subject-wise Analytics</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-1 text-left">Subject</th>
                    <th className="p-1 text-right">Avg %</th>
                    <th className="p-1 text-right">Highest</th>
                    <th className="p-1 text-right">Lowest</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.subjectAnalytics.map((s, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-1">{s.subjectName}</td>
                      <td className="p-1 text-right">
                        {s.avgPercentage.toFixed(2)}%
                      </td>
                      <td className="p-1 text-right">
                        {s.highestPercentage?.toFixed(2)}%
                      </td>
                      <td className="p-1 text-right">
                        {s.lowestPercentage?.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border rounded-xl p-4 bg-white shadow-sm">
              <h3 className="font-semibold mb-2 text-sm">Weak Students (below 40%)</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-1 text-left">Student</th>
                    <th className="p-1 text-right">% Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.weakStudents.map((w, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-1">
                        {w.studentName} ({w.admissionNo})
                      </td>
                      <td className="p-1 text-right">
                        {w.percentage.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                  {!analytics.weakStudents.length && (
                    <tr>
                      <td colSpan={2} className="p-3 text-center text-gray-500">
                        No weak students (below 40%) in this class. 🎉
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4">
            <button
              onClick={runAiInsights}
              className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm"
              disabled={aiLoading}
            >
              {aiLoading ? "AI analysing..." : "Generate AI Suggestions (Gemini)"}
            </button>
          </div>

          {aiResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="border rounded-xl p-4 bg-white shadow-sm">
                <h4 className="font-semibold mb-2 text-purple-700">
                  Class Feedback
                </h4>
                <ul className="list-disc list-inside text-gray-700">
                  {(aiResult.classFeedback || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="border rounded-xl p-4 bg-white shadow-sm">
                <h4 className="font-semibold mb-2 text-blue-700">
                  Teacher Actions
                </h4>
                <ul className="list-disc list-inside text-gray-700">
                  {(aiResult.teacherActions || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="border rounded-xl p-4 bg-white shadow-sm">
                <h4 className="font-semibold mb-2 text-green-700">
                  Parent & Student Suggestions
                </h4>
                <ul className="list-disc list-inside text-gray-700">
                  {(aiResult.parentSuggestions || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
