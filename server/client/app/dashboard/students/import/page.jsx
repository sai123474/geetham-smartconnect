"use client";
import { useState } from "react";

export default function ImportStudents() {
  const [file, setFile] = useState(null);

  const upload = async () => {
    const form = new FormData();
    form.append("file", file);

    const token = localStorage.getItem("token");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/import-csv`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });

    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <div className="p-6">
      <h1 className="font-bold text-xl mb-4">Bulk Student Import (CSV)</h1>

      <input type="file" accept=".csv" onChange={(e)=>setFile(e.target.files[0])} />
      <button className="bg-blue-600 text-white px-4 py-1 ml-2" onClick={upload}>Upload</button>
    </div>
  );
}
