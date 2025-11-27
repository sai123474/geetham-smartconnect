"use client";

import { useState, useEffect } from "react";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  const load = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setLogs(data.logs);
  };

  useEffect(() => load(), []);

  return (
    <div className="p-6">
      <h1 className="font-bold text-xl mb-4">Activity Logs</h1>

      <table className="border w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">User</th>
            <th className="p-2">Action</th>
            <th className="p-2">Module</th>
            <th className="p-2">Details</th>
            <th className="p-2">At</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(l => (
            <tr key={l._id} className="border-t">
              <td className="p-2">{l.user?.name}</td>
              <td className="p-2">{l.action}</td>
              <td className="p-2">{l.module}</td>
              <td className="p-2">{JSON.stringify(l.meta)}</td>
              <td className="p-2">{new Date(l.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex gap-3">
  <a
    href={`${process.env.NEXT_PUBLIC_API_URL}/logs/export/csv`}
    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
    target="_blank"
  >
    Export CSV (Excel)
  </a>
  <a
    href={`${process.env.NEXT_PUBLIC_API_URL}/logs/export/pdf`}
    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
    target="_blank"
  >
    Export PDF
  </a>
</div>

    </div>
  );
}
