"use client";

import Cookies from "js-cookie";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [stats, setStats] = useState({ students: 0, applications: 0, fees: 0 });

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return router.push("/login");

    setRole(Cookies.get("role") || "guest");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((d) => setStats(d.data || {}))
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Students" value={stats.students} />
          <StatCard title="Applications" value={stats.applications} />
          <StatCard title="Fees Collected" value={`₹ ${stats.fees}`} />
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 text-center">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
    </div>
  );
}
