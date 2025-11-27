"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function OcrMarksUpload() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);

  const upload = async () => {
    const form = new FormData();
    form.append("file", file);

    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/marks/ocr`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    const data = await res.json();
    setResponse(data);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">OCR Marks Entry</h1>

      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={upload}
      >
        Upload for OCR
      </button>

      {response && (
        <pre className="mt-4 bg-gray-200 p-3 rounded text-xs overflow-auto">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
