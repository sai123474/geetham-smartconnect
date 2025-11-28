"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const token = Cookies.get("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/application`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setApplications(data.applications || []));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admission Applications</h1>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Class</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app._id} className="border-b">
              <td className="p-3">{app.name}</td>
              <td className="p-3">{app.classApplyingFor}</td>
              <td className="p-3">{app.status}</td>
              <td className="p-3">
                <button className="bg-green-600 text-white px-3 rounded mr-2">
                  Approve
                </button>
                <button className="bg-blue-600 text-white px-3 rounded">
                  PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
