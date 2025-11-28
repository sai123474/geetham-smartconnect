"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const fetchApplication = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/application/${id}`
      );
      const data = await res.json();
      setApp(data.application || null);
    } catch (err) {
      console.error(err);
      alert("Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApprove = async () => {
    if (!window.confirm("Approve this application and create student profile?"))
      return;

    try {
      setWorking(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/application/${id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Approve failed");
        return;
      }

      alert("Application approved & student created.");
      fetchApplication();
    } catch (err) {
      console.error(err);
      alert("Error approving application");
    } finally {
      setWorking(false);
    }
  };

  const handleGeneratePdf = async () => {
    try {
      setWorking(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/application/${id}/generate-pdf`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to generate PDF");
        return;
      }

      alert("PDF generated successfully");
      // refresh details so applicationPdfUrl is updated
      fetchApplication();
    } catch (err) {
      console.error(err);
      alert("Error generating PDF");
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-500">Loading application…</p>;
  }

  if (!app) {
    return (
      <div className="p-6">
        <p className="text-red-600">Application not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <button
        className="text-sm text-blue-600 underline mb-4"
        onClick={() => router.push("/dashboard/applications")}
      >
        ← Back to Applications
      </button>

      <h1 className="text-xl font-bold text-blue-600 mb-2">
        Application #{app.applicationId}
      </h1>
      <p className="text-gray-500 mb-4">
        Status:{" "}
        <span
          className={
            app.status === "approved"
              ? "text-green-600 font-semibold"
              : app.status === "rejected"
              ? "text-red-600 font-semibold"
              : "text-yellow-700 font-semibold"
          }
        >
          {app.status || "pending"}
        </span>
      </p>

      <div className="bg-white rounded-xl shadow border p-4 mb-4 space-y-1 text-sm">
        <p>
          <b>Name:</b> {app.name}
        </p>
        <p>
          <b>Class Applying For:</b> {app.classApplyingFor}
        </p>
        <p>
          <b>Phone:</b> {app.phone}
        </p>
        <p>
          <b>Parent Name:</b> {app.parentName}
        </p>
        <p>
          <b>Address:</b> {app.address}
        </p>
        <p>
          <b>Previous School:</b> {app.previousSchool || "-"}
        </p>
        <p>
          <b>Aadhar:</b> {app.aadharNo}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={handleApprove}
          disabled={working || app.status === "approved"}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm disabled:bg-gray-400"
        >
          {app.status === "approved" ? "Already Approved" : "Approve Application"}
        </button>

        <button
          onClick={handleGeneratePdf}
          disabled={working}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Generate Application PDF
        </button>

        {app.applicationPdfUrl && (
          <a
            href={app.applicationPdfUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 underline text-sm"
          >
            View Latest Application PDF
          </a>
        )}
      </div>
    </div>
  );
}

