import Link from "next/link";

export const metadata = {
  title: "Geetham SmartConnect",
  description: "LMS & ERP portal for Geetham Educational Institutions",
};

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl border border-slate-200">
        <h1 className="text-2xl font-bold text-blue-700 text-center">
          Geetham SmartConnect
        </h1>
        <p className="text-sm text-gray-600 text-center mt-1">
          Unified portal for Students, Parents, Staff and Management
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Login (Admin / Staff / Accountant / Principal)
          </Link>

          <Link
            href="/login?role=student"
            className="w-full inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition"
          >
            Student / Parent Login
          </Link>

          <Link
            href="/admissions/apply"
            className="w-full inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition"
          >
            Online Admission Application
          </Link>
        </div>

        <p className="mt-6 text-[11px] text-center text-gray-500">
          © {new Date().getFullYear()} Geetham Educational Institutions. All rights reserved.
        </p>
      </div>
    </main>
  );
}
