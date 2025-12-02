"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Briefcase, UserCircle, LogOut, User, ChevronDown } from "lucide-react";
import TierBadge from "../ui/tierBadge";
import { AnimatePresence, motion } from "framer-motion";




export default function DashboardNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🪄 Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <nav className="fixed top-0 left-64 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-orange-500">
          Loyalty CardX
        </Link>

         {/* 🔹 Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <Link href="/features" className="hover:text-orange-500 transition">
            Feature
          </Link>
          <Link href="/pricing" className="hover:text-orange-500 transition">

           Pricing

          </Link>
          <Link href="deals" className="hover:text-orange-500 transition">
            Deals
          </Link>
          <Link href="/campaigns" className="hover:text-orange-500 transition">
            Campaigns
          </Link>
        </div>


   {/* 🧩 Tier Badge + Avatar / Dropdown */}
        <div ref={dropdownRef} className="relative flex items-center gap-3">
          <div className="hidden sm:block">
            <Link href="/dashboard/tier">
              <TierBadge tier="Gold" />
            </Link>
          </div>

          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-orange-100 text-orange-600 font-semibold px-3 py-2 rounded-full hover:bg-orange-200 transition"
          >
            <UserCircle size={22} className="text-gray-600" />
            <span className="hidden md:inline-block text-gray-700 font-medium">Doe</span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {/* Dropdown (desktop) */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="hidden md:block absolute right-0 top-12 w-44 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden z-[999]"
              >
                <button
                  className="flex items-center gap-2 w-full px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition text-left"
                  onClick={() => (window.location.href = "/dashboard/profile")}
                >
                  <User size={18} />
                  Profile
                </button>
                <button
                  className="flex items-center gap-2 w-full px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-red-600 transition text-left border-t border-gray-100"
                  onClick={() => console.log("Logging out...")}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 📱 Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-700 focus:outline-none p-1.5 rounded-lg hover:bg-orange-50"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 📱 Mobile Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-md px-4 py-4 space-y-3"
          >
            <TierBadge tier="Gold" />
            <Link href="/dashboard" className="block text-gray-700 hover:text-orange-500 transition">
              Overview
            </Link>
            <Link href="/dashboard/campaigns" className="block text-gray-700 hover:text-orange-500 transition">
              Campaigns
            </Link>
            <Link href="/dashboard/customers" className="block text-gray-700 hover:text-orange-500 transition">
              Customers
            </Link>
            <Link href="/dashboard/reports" className="block text-gray-700 hover:text-orange-500 transition">
              Reports
            </Link>

            {/* Profile + Logout (bottom sheet style) */}
            <div className="border-t border-gray-200 pt-3">
              <button
                onClick={() => (window.location.href = "/dashboard/profile")}
                className="flex items-center gap-2 w-full text-gray-700 hover:text-orange-600 py-2 transition"
              >
                <User size={18} /> Profile
              </button>
              <button
                onClick={() => console.log("Logging out...")}
                className="flex items-center gap-2 w-full text-gray-700 hover:text-red-600 py-2 transition"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>

            <div className="flex justify-center pt-2">
              <div className="flex items-center gap-2 bg-orange-100 text-orange-600 font-semibold px-4 py-2 rounded-full">
                <Briefcase size={16} />
                <span>Business Account</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
