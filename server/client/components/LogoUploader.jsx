"use client";
import { useState, useEffect } from "react";

export default function LogoUploader({ onUpload, required = true }) {
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    setError("");
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    onUpload(file);
  };

  return (
    <div className="mb-4 flex flex-col items-center justify-center border border-gray-200 p-4 rounded-2xl bg-white shadow-sm">
      <h3 className="font-semibold mb-2 text-lg">
        College Logo {required && <span className="text-red-500">*</span>}
      </h3>
      <p className="text-xs text-gray-500 mb-2">
        This logo will be used on all Progress Cards / Hall Tickets.
      </p>
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="p-2 border rounded-md text-sm"
      />
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      {logoPreview && (
        <img
          src={logoPreview}
          alt="College Logo Preview"
          className="mt-3 w-28 h-28 object-contain border rounded-xl bg-gray-50"
        />
      )}
    </div>
  );
}
