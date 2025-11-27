"use client";
import { useState } from "react";

export default function OnlineAdmissionForm() {
  const [form, setForm] = useState({});
  const [photo, setPhoto] = useState(null);

  const submit = async () => {
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (photo) data.append("photo", photo);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/application`, {
      method: "POST",
      body: data
    });

    const d = await res.json();
    alert(`Application submitted — ID: ${d.application.applicationId}`);
  };

  export default function AdmissionsLayout({ children }) {
  return <>{children}</>;
}

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Online Admission Application</h1>

      <input className="border mb-2 p-2 w-full" placeholder="Full Name"
        onChange={(e) => setForm({...form, name: e.target.value})}/>

      <input className="border mb-2 p-2 w-full" placeholder="Phone"
        onChange={(e) => setForm({...form, phone: e.target.value})}/>

      <input type="date" className="border mb-2 p-2 w-full"
        onChange={(e) => setForm({...form, dob: e.target.value})}/>

      <input className="border mb-2 p-2 w-full" placeholder="Class Applying For"
        onChange={(e) => setForm({...form, classApplyingFor: e.target.value})}/>

      <textarea className="border mb-2 p-2 w-full" placeholder="Address"
        onChange={(e) => setForm({...form, address: e.target.value})}/>

      <input type="file" className="mb-3" onChange={(e) => setPhoto(e.target.files[0])}/>

      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={submit}>
        Submit Application
      </button>
    </div>
  );
}
