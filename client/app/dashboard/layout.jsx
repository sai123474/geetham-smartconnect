"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState("user");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role") || "user";

    if (!token) {
      // not logged in → go to login
      router.replace("/login");
    } else {
      setRole(savedRole);
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Checking access…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
