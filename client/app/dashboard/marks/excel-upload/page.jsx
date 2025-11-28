"use client";

import { useState } from "react";

export default function MarksExcelUploadPage() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Select an Excel file first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/marks/import/excel`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Upload failed");
        return;
      }

      alert("Marks Excel processed successfully");
    } catch (err) {
      console.error(err);
      alert("Error uploading Excel");
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold text-blue-600 mb-4">
        Marks Import – Excel Upload
      </h1>

      <div className="bg-white p-4 rounded-xl shadow border space-y-3 text-sm">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Upload & Process
        </button>
      </div>
    </div>
  );
}
