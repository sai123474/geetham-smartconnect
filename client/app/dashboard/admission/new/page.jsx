"use client";
import { useState } from "react";

export default function NewApplicationForm() {
  const [form, setForm] = useState({});
  const [photo, setPhoto] = useState(null);

  const save = async () => {
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, v));
    if (photo) body.append("photo", photo);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/application`,
      {
        method: "POST",
        body
      }
    );

    const d = await res.json();
    alert("Application Submitted");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto dark:text-white">
      <h1 className="text-xl font-bold mb-4">New Admission Application</h1>

      <input className="border mb-2 p-2 w-full" placeholder="Academic Year" onChange={(e) => setForm({ ...form, academicYear: e.target.value })}/>
      <input className="border mb-2 p-2 w-full" placeholder="Student Name" onChange={(e) => setForm({ ...form, name: e.target.value })}/>
      <input className="border mb-2 p-2 w-full" placeholder="Gender" onChange={(e) => setForm({ ...form, gender: e.target.value })}/>
      <input type="date" className="border mb-2 p-2 w-full" onChange={(e) => setForm({ ...form, dob: e.target.value })}/>
      <input className="border mb-2 p-2 w-full" placeholder="Class Applying For" onChange={(e) => setForm({ ...form, classApplyingFor: e.target.value })}/>
      <input className="border mb-2 p-2 w-full" placeholder="Parent Name" onChange={(e) => setForm({ ...form, parentName: e.target.value })}/>
      <input className="border mb-2 p-2 w-full" placeholder="Phone" onChange={(e) => setForm({ ...form, phone: e.target.value })}/>
      <textarea className="border mb-2 p-2 w-full" placeholder="Address" onChange={(e) => setForm({ ...form, address: e.target.value })}/>
      <input type="file" className="mb-3" onChange={(e) => setPhoto(e.target.files[0])}/>

      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={save}>
        Save Application
      </button>
    </div>
  );
}
