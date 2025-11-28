"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">
        Geetham SmartConnect
      </h1>

      <p className="text-gray-600 mb-6 text-center">
        Welcome to the Digital Academic Management System
      </p>

      {/* Login button */}
      <Link href="/login">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-md mb-4">
          Login
        </button>
      </Link>

      {/* Go to dashboard */}
      <Link href="/dashboard">
        <button className="bg-emerald-600 text-white px-6 py-3 rounded-md mb-3">
          Go to Dashboard
        </button>
      </Link>

      {/* Admission apply page */}
      <Link
        href="/admissions/apply"
        className="text-blue-600 underline mt-2"
      >
        Apply for Admission
      </Link>

      {/* Track Application Status */}
      <Link
        href="/admissions/status"
        className="text-blue-600 underline mt-4 block"
      >
        Track Application Status
      </Link>
    </div>
  );
}
