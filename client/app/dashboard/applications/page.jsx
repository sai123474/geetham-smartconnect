"use client";

import { useEffect, useState } from "react";

export default function ApplicationsListPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/application`, {
        method: "GET",
      });
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-blue-600 mb-4">Admission Applications</h1>

      <table className="w-full border rounded-lg shadow bg-white">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="p-2">App ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Class</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {applications.map((app) => (
            <tr key={app._id} className="border text-center hover:bg-gray-100 cursor-pointer">
              <td className="p-2">{app.applicationId}</td>
              <td className="p-2">{app.name}</td>
              <td className="p-2">{app.classApplyingFor}</td>
              <td className="p-2">{app.phone}</td>
              <td className="p-2 font-semibold text-green-600">{app.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
