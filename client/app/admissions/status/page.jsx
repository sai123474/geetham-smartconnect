"use client";

import { useState } from "react";

export default function CheckStatusPage() {
  const [applicationId, setApplicationId] = useState("");
  const [result, setResult] = useState(null);

  const checkStatus = async () => {
    if (!applicationId.trim()) return alert("Enter Application ID");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/application/status/${applicationId}`
      );

      const data = await res.json();
      setResult(data.application || null);
    } catch (error) {
      console.error(error);
      alert("Unable to fetch status");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start pt-10 bg-gray-100">
      <div className="bg-white p-6 w-full max-w-lg rounded-xl shadow">
        <h1 className="text-xl font-bold text-blue-600 text-center mb-4">
          Track Admission Application Status
        </h1>

        <input
          type="text"
          placeholder="Enter Application ID"
          className="border p-3 w-full rounded mb-3"
          onChange={(e) => setApplicationId(e.target.value)}
        />

        <button
          onClick={checkStatus}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Check Status
        </button>

        {result && (
          <div className="bg-green-50 p-4 mt-4 rounded border border-green-300">
            <p><strong>Name:</strong> {result.name}</p>
            <p><strong>Class:</strong> {result.classApplyingFor}</p>
            <p><strong>Status:</strong> {result.status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
