"use client";

import Cookies from "js-cookie";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      router.push("/login"); // if not logged in redirect to login
      return;
    }

    setRole(Cookies.get("role") || "guest");
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to Geetham SmartConnect Dashboard ({role.toUpperCase()}).
        </p>
      </main>
    </div>
  );
}
