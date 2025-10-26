"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, Gift, Users, Settings, Home } from "lucide-react";

export default function StaffDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { label: "Overview", href: "/staff/dashboard", icon: <Home className="h-5 w-5" /> },
    { label: "Redeem Rewards", href: "/staff/dashboard/redeem", icon: <Gift className="h-5 w-5" /> },
    { label: "Customers", href: "/staff/dashboard/customers", icon: <Users className="h-5 w-5" /> },
    { label: "Settings", href: "/staff/dashboard/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
   <div className="flex min-h-screen overflow-y-hidden">

      {/* 🧭 Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-orange-600 text-white shadow-xl transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-orange-500">
          <h2 className="text-lg font-bold">Staff Panel</h2>
          <button
            className="md:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-2 mt-4 px-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-500 transition-all"
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          <button className="flex items-center gap-3 px-3 py-2 mt-8 text-sm text-red-200 hover:bg-orange-500 rounded-lg">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </nav>
      </aside>

      {/* 🧱 Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 bg-gray-50">
        {/* Header */}
        <header className="flex items-center justify-between bg-white p-4 shadow-sm">
          <button
            className="md:hidden text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            Staff Dashboard
          </h1>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
