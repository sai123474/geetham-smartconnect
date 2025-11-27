"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function HostelApprovals() {
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(false);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API}/leave/list?status=${statusFilter}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      if (data.status === "success") {
        setLeaves(data.leaves || []);
      } else {
        setLeaves([]);
      }
    } catch (err) {
      console.error(err);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [statusFilter]);

  const updateStatus = async (id, action) => {
    const token = localStorage.getItem("token");
    const body = action === "reject"
      ? { action, rejectedReason: prompt("Reason for rejection?") || "" }
      : { action };

    const res = await fetch(`${API}/leave/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (data.status === "success") {
      loadLeaves();
    } else {
      alert(data.message || "Failed to update");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto dark:text-white">
      <h1 className="text-xl font-bold mb-4">Hostel Leave Approvals</h1>

      <div className="flex gap-3 mb-4 text-sm">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-1 rounded-md dark:bg-gray-800"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={loadLeaves}
          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-900">
          <table className="w-full text-xs md:text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-2 text-left">Student</th>
                <th className="p-2 text-left">Dates</th>
                <th className="p-2 text-left">Reason</th>
                <th className="p-2 text-left">Fee Due</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id} className="border-t dark:border-gray-700">
                  <td className="p-2">
                    <div className="font-semibold">
                      {l.studentId?.name} ({l.studentId?.admissionNo})
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {l.studentId?.className}-{l.studentId?.section}
                    </div>
                  </td>
                  <td className="p-2">
                    {new Date(l.fromDate).toDateString()} –{" "}
                    {new Date(l.toDate).toDateString()}
                  </td>
                  <td className="p-2">{l.reason}</td>
                  <td className="p-2 text-red-600">
                    ₹{(l.feeDueAtRequest || 0).toFixed(2)}
                    {l.feeBlocked && (
                      <span className="text-[10px] text-red-500 ml-1">
                        (Fee block)
                      </span>
                    )}
                  </td>
                  <td className="p-2 capitalize">{l.status}</td>
                  <td className="p-2">
                    {l.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                          onClick={() => updateStatus(l._id, "approve")}
                        >
                          Approve
                        </button>
                        <button
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                          onClick={() => updateStatus(l._id, "reject")}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!leaves.length && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    No requests for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
