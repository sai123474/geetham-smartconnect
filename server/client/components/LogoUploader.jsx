"use client";
import { useState } from "react";

export default function LogoUploader({ onUpload }) {
  const [logo, setLogo] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(URL.createObjectURL(file));
    onUpload(file);
  };

  return (
    <div className="mb-4 flex flex-col items-center justify-center border p-4 rounded-xl">
      <h3 className="font-semibold mb-2 text-lg">Upload College Logo (Mandatory)</h3>
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        required
        className="p-2 border rounded-md"
      />
      {logo && (
        <img
          src={logo}
          alt="College Logo Preview"
          className="mt-3 w-32 h-32 object-contain border rounded-lg"
        />
      )}
    </div>
  );
}
