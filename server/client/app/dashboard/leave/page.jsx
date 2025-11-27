"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function HostelLeave() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [generatedPDF, setGeneratedPDF] = useState("");

  const submit = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ fromDate, toDate, reason, parentPhone })
    });

    const data = await res.json();
    const pdf = await fetch(`${API}/leave/${data.request._id}/generate-pdf`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    }).then((r) => r.json());

    setGeneratedPDF(pdf.pdfUrl);
  };

  return (
    <div className="p-6 max-w-xl mx-auto dark:text-white">
      <h2 className="text-xl font-bold mb-4">Hostel Leave / Undertaking Request</h2>

      <input className="border p-2 w-full mb-3 dark:bg-gray-800" type="date" onChange={(e) => setFromDate(e.target.value)}/>
      <input className="border p-2 w-full mb-3 dark:bg-gray-800" type="date" onChange={(e) => setToDate(e.target.value)}/>
      <textarea className="border p-2 w-full mb-3 h-24 dark:bg-gray-800" placeholder="Reason" onChange={(e) => setReason(e.target.value)}/>
      <input className="border p-2 w-full mb-3 dark:bg-gray-800" placeholder="Parent/Guardian Phone" onChange={(e) => setParentPhone(e.target.value)}/>

      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={submit}>
        Generate Leave Letter
      </button>

      {generatedPDF && (
        <div className="mt-4">
          <a className="text-blue-500 underline" target="_blank" href={generatedPDF}>
            Download Leave Letter PDF
          </a>
        </div>
      )}
    </div>
  );
}
