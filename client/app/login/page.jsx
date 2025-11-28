"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ emailOrPhone, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // save token
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      router.push("/dashboard");
    } catch (err) {
      alert("Error logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Geetham SmartConnect
        </h1>
        <p className="text-center text-gray-500 mb-6">Login to continue</p>

        <input
          type="text"
          placeholder="Email or Phone"
          className="border p-3 rounded w-full mb-4"
          onChange={(e) => setEmailOrPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded w-full mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-600 w-full text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
