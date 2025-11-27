"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ImportStudentsPreview() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [year, setYear] = useState("2025-26");
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    if (!file) {
      alert("Please select a CSV file first.");
      return;
    }
    try {
      setLoading(true);
      const form = new FormData();
      form.append("file", file);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/students/import-csv/preview?academicYear=${encodeURIComponent(
          year
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );

      const data = await res.json();
      if (data.status === "success") {
        setSummary(data.summary);
        setRows(data.rows);
      } else {
        alert(data.message || "Error in preview");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to preview CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Bulk Student Import – Preview & Check Duplicates</h1>

      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded-md"
        />
        <input
          className="border p-2 rounded-md"
          placeholder="Academic Year e.g. 2025-26"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <button
          onClick={handlePreview}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
          disabled={loading}
        >
          {loading ? "Checking..." : "Preview & Detect Duplicates"}
        </button>
      </div>

      {summary && (
        <div className="mb-4 text-sm bg-gray-50 border rounded-lg p-3">
          <p>Total Rows: <b>{summary.totalRows}</b></p>
          <p className="text-green-700">
            New / Importable: <b>{summary.newCount}</b>
          </p>
          <p className="text-red-700">
            Duplicates / Invalid: <b>{summary.duplicateCount}</b>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Only rows marked as <span className="text-green-700 font-semibold">NEW</span> should be
            imported in the next step.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="border rounded-xl overflow-auto max-h-[420px] text-xs">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Row</th>
                <th className="p-2">Name</th>
                <th className="p-2">Class</th>
                <th className="p-2">Section</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Aadhar</th>
                <th className="p-2">Year</th>
                <th className="p-2">Status</th>
                <th className="p-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.rowIndex}
                  className={
                    r.duplicate
                      ? "bg-red-50 border-t border-red-100"
                      : "bg-green-50 border-t border-green-100"
                  }
                >
                  <td className="p-2">{r.rowIndex}</td>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.className}</td>
                  <td className="p-2">{r.section}</td>
                  <td className="p-2">{r.phone}</td>
                  <td className="p-2">{r.aadharNo}</td>
                  <td className="p-2">{r.academicYear}</td>
                  <td className="p-2 font-semibold">
                    {r.duplicate ? "DUPLICATE" : "NEW"}
                  </td>
                  <td className="p-2 text-[11px] text-gray-700">
                    {r.duplicateReason || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
