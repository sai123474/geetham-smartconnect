"use client";

import { useState } from "react";
import LogoUploader from "@/components/LogoUploader";

export default function ProgressEntry() {
  const [studentId, setStudentId] = useState("");
  const [examName, setExamName] = useState("");
  const [academicYear, setAcademicYear] = useState("2025-26");
  const [subjects, setSubjects] = useState([
    { subjectName: "English", maxMarks: 100, obtainedMarks: "" },
    { subjectName: "Maths", maxMarks: 100, obtainedMarks: "" },
    { subjectName: "Science", maxMarks: 100, obtainedMarks: "" },
  ]);

  const [logoFile, setLogoFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");

  const updateMarks = (index, value) => {
    const updated = [...subjects];
    updated[index].obtainedMarks = value;
    setSubjects(updated);
  };

  const submitReport = async () => {
    if (!logoFile) {
      alert("College Logo is mandatory!");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/progress/student/${studentId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          examName,
          academicYear,
          subjects,
        }),
      }
    );

    const data = await res.json();
    if (data.status === "success") {
      alert("Marks Saved — Now Generate PDF");
    } else {
      alert(data.message);
    }
  };

  const generatePdf = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/progress/${studentId}/generate-pdf`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setPdfUrl(data.pdfUrl);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">
        Progress Report Entry & PDF Generator
      </h1>

      <LogoUploader onUpload={(file) => setLogoFile(file)} />

      <div className="grid gap-3 mb-4">
        <input
          className="border p-2 rounded-md"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        <input
          className="border p-2 rounded-md"
          placeholder="Exam Name (SA1, SA2, Quarterly)"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
        />
      </div>

      <h2 className="font-semibold mb-2">Subjects</h2>

      <table className="w-full border rounded-md">
        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="p-2">Subject</th>
            <th className="p-2">Max Marks</th>
            <th className="p-2">Obtained Marks</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((sub, i) => (
            <tr key={i} className="border-b">
              <td className="p-2">{sub.subjectName}</td>
              <td className="p-2">{sub.maxMarks}</td>
              <td className="p-2">
                <input
                  type="number"
                  className="border p-1 w-24 rounded-md"
                  value={sub.obtainedMarks}
                  onChange={(e) => updateMarks(i, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md"
        onClick={submitReport}
      >
        Save Report
      </button>

      <button
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md ml-2"
        onClick={generatePdf}
      >
        Generate Progress Card PDF
      </button>

      {pdfUrl && (
        <div className="mt-4">
          <a
            href={pdfUrl}
            target="_blank"
            className="text-blue-700 underline font-semibold"
          >
            Download Progress Card PDF
          </a>
        </div>
      )}
    </div>
  );
}
