"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function HallTicketVerifyPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHallTicket = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hallticket/verify/${id}`
      );
      const data = await res.json();
      setTicket(data.hallTicket || null);
    } catch (err) {
      console.error(err);
      alert("Error verifying hall ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchHallTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <p className="p-6 text-gray-500">Verifying…</p>;
  }

  if (!ticket) {
    return (
      <div className="p-6">
        <p className="text-red-600 font-semibold">
          Hall Ticket not found or invalid.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-green-600 mb-3">
        Hall Ticket Verified
      </h1>
      <div className="bg-white border rounded-xl shadow p-4 text-sm space-y-1">
        <p>
          <b>Student:</b> {ticket.studentName}
        </p>
        <p>
          <b>Admission No:</b> {ticket.admissionNo}
        </p>
        <p>
          <b>Class:</b> {ticket.className}
        </p>
        <p>
          <b>Exam:</b> {ticket.examName}
        </p>
      </div>
    </div>
  );
}
