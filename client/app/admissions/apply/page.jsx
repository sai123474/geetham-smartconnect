"use client";

import { useState } from "react";

export default function AdmissionApplyPage() {
  const [form, setForm] = useState({});
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.classApplyingFor) {
      alert("Please fill mandatory fields");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (photo) data.append("photo", photo);

    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/application`, {
        method: "POST",
        body: data
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Submission failed");
        return;
      }

      setSubmittedId(result.application.applicationId);
      alert(`Application submitted successfully. ID: ${result.application.applicationId}`);

    } catch (error) {
      console.log(error);
      alert("Error submitting application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          Online Admission Form
        </h1>

        <div className="space-y-3">

          <input
            type="text"
            placeholder="Full Name *"
            className="border p-3 rounded w-full"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="text"
            placeholder="Phone *"
            className="border p-3 rounded w-full"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            type="date"
            className="border p-3 rounded w-full"
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
          />

          <input
            type="text"
            placeholder="Class Applying For *"
            className="border p-3 rounded w-full"
            onChange={(e) => setForm({ ...form, classApplyingFor: e.target.value })}
          />

          <textarea
            placeholder="Address"
            className="border p-3 rounded w-full"
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <label className="font-medium text-gray-600">Upload Student Photo</label>
          <input
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => setPhoto(e.target.files[0])}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>

          {submittedId && (
            <p className="text-green-600 font-semibold mt-4 text-center">
              🎉 Application submitted — ID: {submittedId}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
