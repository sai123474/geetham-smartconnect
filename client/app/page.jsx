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

      <Link
        href="/dashboard"
        className="bg-blue-600 text-white px-5 py-2 rounded-md shadow hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
