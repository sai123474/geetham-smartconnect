"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplicationsListPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/application`);
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

  if (loading) {
    return <p className="p-6 text-gray-500">Loading applications…</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-blue-600 mb-4">
        Admission Applications
      </h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow border">
        <table className="w-full text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-2 text-left">App ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Class</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr
                key={app._id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/applications/${app._id}`)
                }
              >
                <td className="p-2">{app.applicationId}</td>
                <td className="p-2">{app.name}</td>
                <td className="p-2">{app.classApplyingFor}</td>
                <td className="p-2">{app.phone}</td>
                <td
                  className={`p-2 font-semibold ${
                    app.status === "approved"
                      ? "text-green-600"
                      : app.status === "rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {app.status || "pending"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
