"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function PermissionMatrix() {
  const [matrix, setMatrix] = useState([]);
  const [saving, setSaving] = useState(false);

  const modules = [
    "approveAdmissions", "feeEntry", "marksEntry",
    "attendanceEntry", "hallTicket", "progressCard", "studentImport"
  ];

  const roles = ["superadmin", "dean", "principal", "admin", "accountant", "staff"];

  const load = async () => {
    const res = await fetch(`${API}/permissions`);
    const data = await res.json();
    setMatrix(data.permissions);
  };

  const toggle = async (role, module) => {
    setMatrix(prev =>
      prev.map(p => p.role === role
        ? { ...p, permissions: { ...p.permissions, [module]: !p.permissions[module] }}
        : p
      ));
  };

  const save = async () => {
    setSaving(true);
    await fetch(`${API}/permissions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matrix })
    });
    setSaving(false);
    alert("Permissions updated");
  };

  useEffect(() => load(), []);

  return (
    <div className="p-6">
      <h1 className="font-bold text-xl mb-4">Role Permission Matrix</h1>

      <table className="border w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Module</th>
            {roles.map(r => <th key={r} className="p-2 capitalize">{r}</th>)}
          </tr>
        </thead>
        <tbody>
          {modules.map(m => (
            <tr key={m} className="border-t">
              <td className="p-2 font-semibold">{m}</td>
              {roles.map(r => (
                <td key={r} className="text-center p-2">
                  <input
                    type="checkbox"
                    checked={matrix.find(p => p.role === r)?.permissions[m] || false}
                    onChange={() => toggle(r, m)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="mt-4 bg-blue-600 text-white px-5 py-2 rounded"
        onClick={save}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Permissions"}
      </button>
    </div>
  );
}
