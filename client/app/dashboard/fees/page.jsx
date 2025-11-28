"use client";

import { useState } from "react";

export default function FeeCollectionPage() {
  const [form, setForm] = useState({
    admissionNo: "",
    amount: "",
    mode: "CASH",
    reference: "",
    academicYear: "",
  });
  const [loading, setLoading] = useState(false);

  const handleCollect = async () => {
    if (!form.admissionNo || !form.amount || !form.academicYear) {
      alert("Admission No, Amount & Year are required");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fees/collect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Fee collection failed");
        return;
      }

      alert("Fee collected successfully");
    } catch (err) {
      console.error(err);
      alert("Error collecting fee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold text-blue-600 mb-4">Collect Fee</h1>

      <div className="space-y-3 bg-white rounded-xl shadow p-4 border text-sm">
        <input
          className="border p-2 rounded w-full"
          placeholder="Admission No"
          onChange={(e) =>
            setForm({ ...form, admissionNo: e.target.value })
          }
        />

        <input
          className="border p-2 rounded w-full"
          placeholder="Academic Year (e.g. 2025-26)"
          onChange={(e) =>
            setForm({ ...form, academicYear: e.target.value })
          }
        />

        <input
          className="border p-2 rounded w-full"
          placeholder="Amount"
          type="number"
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        <select
          className="border p-2 rounded w-full"
          value={form.mode}
          onChange={(e) => setForm({ ...form, mode: e.target.value })}
        >
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="CARD">Card</option>
          <option value="BANK">Bank Transfer</option>
        </select>

        <input
          className="border p-2 rounded w-full"
          placeholder="Reference / UPI Txn ID"
          onChange={(e) => setForm({ ...form, reference: e.target.value })}
        />

        <button
          onClick={handleCollect}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          {loading ? "Collecting..." : "Collect Fee"}
        </button>
      </div>
    </div>
  );
}
