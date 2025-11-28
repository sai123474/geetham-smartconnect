"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      toast.error("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, password }),
      });

      const data = await res.json();

      if (!res.ok) return toast.error(data.message);

      Cookies.set("token", data.token);      // store token
      Cookies.set("role", data.user.role);   // store role

      toast.success("Login successful!");

      // redirect based on role
      if (data.user.role === "superadmin" || data.user.role === "admin") {
        router.push("/dashboard");
      } else if (data.user.role === "parent" || data.user.role === "student") {
        router.push("/dashboard/student");
      }
    } catch (err) {
      toast.error("Error logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster />
      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}
