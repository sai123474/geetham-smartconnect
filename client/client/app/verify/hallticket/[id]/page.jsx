"use client";

import { useEffect, useState } from "react";

export default function VerifyPage({ params }) {
  const { id } = params;
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/hall-ticket/${id}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData({ error: true }));
  }, [id]);

  if (!data) return <p className="p-6 text-center">Verifying...</p>;

  if (data.error || !data.hall) {
    return (
      <div className="p-6 text-center text-red-600 font-bold">
        ⚠ Invalid or Tampered Document
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-xl font-bold">Document Verified</h1>
      <p className="mt-3 text-green-600 font-semibold">Authentic & Original ✔</p>

      <div className="mt-4 p-4 bg-gray-50 rounded border">
        <p>Student: {data.hall.studentId.name}</p>
        <p>Exam: {data.hall.examName}</p>
        <p>Hall Ticket No: {data.hall.hallTicketNumber}</p>
        <p>Fee Due: {data.hall.feeDue}</p>
      </div>
    </div>
  );
}
