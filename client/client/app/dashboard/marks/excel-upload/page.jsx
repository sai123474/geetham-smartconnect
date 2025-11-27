"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function MarksExcelUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const upload = async () => {
    const form = new FormData();
    form.append("file", file);

    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/import/marks/import-excel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });

    const data = await res.json();
    setResult(data.extracted);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Import Marks From Excel</h1>

      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={upload}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload & Extract
      </button>

      {result && (
        <pre className="mt-4 bg-gray-200 p-3 text-xs rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
