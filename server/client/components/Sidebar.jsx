"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  FileSpreadsheet,
  ClipboardList,
  GraduationCap,
  Receipt,
  Settings,
  LogOut,
  Upload,
  ShieldCheck,
  Monitor,
  UserCog
} from "lucide-react";

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const SidebarItem = ({ href, label, icon: Icon }) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 text-sm font-medium hover:bg-blue-50 transition ${
        pathname === href ? "bg-blue-100 text-blue-700 font-bold" : "text-gray-700"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );

  return (
    <aside className="w-64 bg-white border-r shadow-sm min-h-screen flex flex-col">
      <div className="p-5 border-b">
        <h1 className="text-xl font-bold text-blue-700">SmartConnect Admin</h1>
        <p className="text-xs text-gray-500 capitalize">Role: {role}</p>
      </div>

      <nav className="flex-1 overflow-y-auto">

        <SidebarItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} />

        {/* Admissions Menu */}
        <div>
          <button
            className="flex w-full items-center justify-between px-4 py-2 font-semibold text-sm text-gray-700 hover:bg-blue-50"
            onClick={() => toggleMenu("admissions")}
          >
            <span className="flex items-center gap-3">
              <GraduationCap size={18} /> Admissions
            </span>
          </button>

          {openMenu === "admissions" && (
            <div className="ml-8 flex flex-col">
              <SidebarItem href="/dashboard/applications" label="Applications" icon={FileCheck} />
              <SidebarItem href="/dashboard/admissions/import" label="Bulk Import" icon={Upload} />
              <SidebarItem href="/dashboard/admissions/approved" label="Approved Students" icon={Users} />
            </div>
          )}
        </div>

        {/* Fees Menu */}
        <div>
          <button
            className="flex w-full items-center justify-between px-4 py-2 font-semibold text-sm text-gray-700 hover:bg-blue-50"
            onClick={() => toggleMenu("fees")}
          >
            <span className="flex items-center gap-3">
              <Receipt size={18} /> Fees & Finance
            </span>
          </button>

          {openMenu === "fees" && (
            <div className="ml-8 flex flex-col">
              <SidebarItem href="/dashboard/fees" label="Collect Fee" icon={Receipt} />
              <SidebarItem href="/dashboard/fees/due" label="Fee Due & Letters" icon={ClipboardList} />
            </div>
          )}
        </div>

        {/* Exams & Marks */}
        <div>
          <button
            className="flex w-full items-center justify-between px-4 py-2 font-semibold text-sm text-gray-700 hover:bg-blue-50"
            onClick={() => toggleMenu("exam")}
          >
            <span className="flex items-center gap-3">
              <FileSpreadsheet size={18} /> Exams
            </span>
          </button>

          {openMenu === "exam" && (
            <div className="ml-8 flex flex-col">
              <SidebarItem href="/dashboard/marks" label="Marks Entry" icon={FileSpreadsheet} />
              <SidebarItem href="/dashboard/progress-card" label="Progress Cards" icon={ClipboardList} />
              <SidebarItem href="/dashboard/hall-ticket" label="Hall Tickets" icon={FileCheck} />
            </div>
          )}
        </div>

        {/* System Menu */}
        {(role === "superadmin" || role === "dean" || role === "principal" || role === "admin") && (
          <div>
            <button
              className="flex w-full items-center justify-between px-4 py-2 font-semibold text-sm text-gray-700 hover:bg-blue-50"
              onClick={() => toggleMenu("system")}
            >
              <span className="flex items-center gap-3">
                <Settings size={18} /> System
              </span>
            </button>

            {openMenu === "system" && (
              <div className="ml-8 flex flex-col">
                <SidebarItem href="/dashboard/users" label="User Roles" icon={UserCog} />
                <SidebarItem href="/dashboard/permissions" label="Permissions Matrix" icon={ShieldCheck} />
                <SidebarItem href="/dashboard/logs" label="Activity Logs" icon={Monitor} />
                <SidebarItem href="/dashboard/security/sessions" label="Active Sessions" icon={Monitor} />
              </div>
            )}
          </div>
        )}
      </nav>

      <button className="flex items-center gap-3 px-4 py-3 border-t hover:bg-red-50 text-red-600 font-semibold">
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}
