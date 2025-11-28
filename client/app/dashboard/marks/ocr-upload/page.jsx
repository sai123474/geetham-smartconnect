"use client";

import { useState } from "react";

export default function MarksOcrUploadPage() {
  const [image, setImage] = useState(null);

  const handleUpload = async () => {
    if (!image) return alert("Select a sheet photo first");

    const formData = new FormData();
    formData.append("file", image);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/marks/import/ocr`,
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
        alert(data.message || "OCR failed");
        return;
      }

      alert("OCR processed marks successfully");
    } catch (err) {
      console.error(err);
      alert("Error running OCR");
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold text-blue-600 mb-4">
        Marks Import – OCR Upload
      </h1>

      <div className="bg-white p-4 rounded-xl shadow border space-y-3 text-sm">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Upload for OCR
        </button>
      </div>
    </div>
  );
}
