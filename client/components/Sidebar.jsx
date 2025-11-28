"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Receipt,
  ClipboardList,
  FileSpreadsheet,
  Settings,
  LogOut,
} from "lucide-react";

export default function Sidebar({ role }) {
  const pathname = usePathname();

  const Item = ({ href, label, Icon }) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm mb-1
      ${pathname === href ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-100"}`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );

  return (
    <aside className="w-60 bg-white border-r min-h-screen p-4">
      <h2 className="text-xl font-bold text-blue-700 mb-4">SmartConnect</h2>
      <div className="text-xs text-gray-500 mb-4">Role: {role}</div>

      <Item href="/dashboard" label="Dashboard" Icon={LayoutDashboard} />
      <Item href="/dashboard/applications" label="Applications" Icon={GraduationCap} />
      <Item href="/dashboard/students/import" label="Bulk Import" Icon={Users} />
      <Item href="/dashboard/marks" label="Marks Entry" Icon={FileSpreadsheet} />
      <Item href="/dashboard/fees" label="Fee Collection" Icon={Receipt} />
      <Item href="/dashboard/logs" label="Activity Logs" Icon={ClipboardList} />

      <div className="mt-8 border-t pt-3">
        <Item href="/dashboard/settings" label="System Settings" Icon={Settings} />
      </div>

      <button className="flex items-center gap-3 mt-auto text-red-600 px-4 py-2">
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}
