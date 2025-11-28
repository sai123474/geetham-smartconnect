"use client";

import { useState } from "react";

export default function ProgressEntryPage() {
  const [admissionNo, setAdmissionNo] = useState("");
  const [examName, setExamName] = useState("");
  const [marks, setMarks] = useState(""); // simple JSON or CSV string for now

  const handleSave = async () => {
    if (!admissionNo || !examName || !marks) {
      alert("Fill all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/progress/manual`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ admissionNo, examName, marksRaw: marks }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to save progress");
        return;
      }

      alert("Progress saved successfully");
    } catch (err) {
      console.error(err);
      alert("Error saving progress");
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold text-blue-600 mb-4">
        Manual Progress Entry
      </h1>

      <div className="bg-white p-4 rounded-xl shadow border space-y-3 text-sm">
        <input
          className="border p-2 rounded w-full"
          placeholder="Admission No"
          onChange={(e) => setAdmissionNo(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Exam Name (e.g. FA1)"
          onChange={(e) => setExamName(e.target.value)}
        />
        <textarea
          className="border p-2 rounded w-full min-h-[100px]"
          placeholder='Marks data (e.g. JSON or "Math: 90, Science: 85")'
          onChange={(e) => setMarks(e.target.value)}
        />

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Save Progress
        </button>
      </div>
    </div>
  );
}
