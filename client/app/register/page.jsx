"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("parent"); // default role
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !emailOrPhone || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // backend expects email + phone separately; for now treat this as email
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email: emailOrPhone,
            phone: emailOrPhone,
            password,
            role,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      alert("Registration successful. Please login.");
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert("Error during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Create an Account
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Register for Geetham SmartConnect
        </p>

        <input
          type="text"
          placeholder="Full Name"
          className="border p-3 rounded w-full mb-3"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Email or Phone"
          className="border p-3 rounded w-full mb-3"
          onChange={(e) => setEmailOrPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded w-full mb-3"
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="border p-3 rounded w-full mb-4"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="parent">Parent</option>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="bg-emerald-600 w-full text-white py-3 rounded-lg font-semibold hover:bg-emerald-700"
        >
          {loading ? "Creating account…" : "Register"}
        </button>

        <p className="text-xs text-center text-gray-500 mt-4">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-blue-600 underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
