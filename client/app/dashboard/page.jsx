"use client";

import Sidebar from "@/components/Sidebar";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to Geetham SmartConnect Dashboard.
        </p>
      </main>
    </div>
  );
}
