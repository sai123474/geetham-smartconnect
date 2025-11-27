"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);

  const loadSessions = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/sessions/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.status === "success") setSessions(data.sessions);
  };

  const handleLogoutSession = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/sessions/${id}/logout`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadSessions();
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Logged-in Devices</h1>
      <p className="text-sm text-gray-600 mb-3">
        You can see all devices where your account is active and logout from other devices.
      </p>

      <table className="w-full text-sm border rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Device / Browser</th>
            <th className="p-2">IP</th>
            <th className="p-2">Last Activity</th>
            <th className="p-2">Status</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s._id} className="border-t">
              <td className="p-2">{s.userAgent}</td>
              <td className="p-2">{s.ip || "-"}</td>
              <td className="p-2">
                {new Date(s.lastActivityAt || s.updatedAt).toLocaleString()}
              </td>
              <td className="p-2">
                {s.isActive ? (
                  <span className="text-green-600 font-semibold">Active</span>
                ) : (
                  <span className="text-gray-500">Logged out</span>
                )}
              </td>
              <td className="p-2">
                {s.isActive && (
                  <button
                    onClick={() => handleLogoutSession(s._id)}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded"
                  >
                    Logout Device
                  </button>
                )}
              </td>
            </tr>
          ))}
          {!sessions.length && (
            <tr>
              <td colSpan={5} className="p-3 text-center text-gray-500">
                No sessions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
