"use client";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  // Retrieve user role (from JWT decode / global state)
  const role = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || "{}").role
    : "admin";

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />

      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
