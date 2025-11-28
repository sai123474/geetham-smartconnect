"use client";

import { useState } from "react";

export default function FeeDuePage() {
  const [admissionNo, setAdmissionNo] = useState("");
  const [due, setDue] = useState(null);

  const checkDue = async () => {
    if (!admissionNo.trim()) return alert("Enter Admission No");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fees/due/${admissionNo}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const data = await res.json();
      setDue(data || null);
    } catch (err) {
      console.error(err);
      alert("Error fetching fee due");
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold text-blue-600 mb-4">
        Fee Due & Letter
      </h1>

      <div className="bg-white rounded-xl shadow p-4 border text-sm space-y-3">
        <input
          className="border p-2 rounded w-full"
          placeholder="Admission No"
          onChange={(e) => setAdmissionNo(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={checkDue}
        >
          Check Fee Due
        </button>

        {due && (
          <div className="mt-4 bg-yellow-50 border border-yellow-300 p-3 rounded">
            <p>
              <b>Student:</b> {due.studentName}
            </p>
            <p>
              <b>Total Due:</b> ₹ {due.totalDue}
            </p>
            <p>
              <b>Next Due Date:</b> {due.nextDueDate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
