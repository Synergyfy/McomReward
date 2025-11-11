"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  UserCircle,
  LogOut,
  User,
  ChevronDown,
  Home,
  Wallet,
  Megaphone,
  Heart,
    HandCoins,
    HelpCircle,
    Shield,
  
} from "lucide-react";
import TierBadge from "@/components/ui/tierBadge";
import NotificationDropdown from "@/app/(customer)/components/NotificationDropdown";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function DashboardNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();



  // 🪄 Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkClasses = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center p-2 rounded-lg transition-colors duration-200 ${
      isActive
        ? "bg-orange-600 text-white"
        : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
    }`;
  };

  return (
    <nav className="fixed top-0 left-64 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-4">
        {/* 🧡 Logo */}
        <Link
          href="/"
          className="hidden md:block text-2xl font-bold text-orange-500"
        >
          Loyalty CardX
        </Link>

        {/* 🔹 Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <Link
            href="/point-balance"
            className="hover:text-orange-500 transition"
          >
            Point Balance
          </Link>
          <Link
            href="/matching-points"
            className="hover:text-orange-500 transition"
          >
            Matching Points
          </Link>
          <Link href="/badge-level" className="hover:text-orange-500 transition">
            Badge Level
          </Link>
        </div>

        {/* 🧩 Tier Badge + Notifications + Profile */}
        <div ref={dropdownRef} className="relative flex items-center gap-3">
          {/* 🏅 Tier Badge */}
          <div className="hidden sm:block">
            <Link href="/dashboard/tier">
              <TierBadge tier="Gold" />
            </Link>
          </div>

          {/* 🔔 Notifications */}
          <div className="hidden md:block">
            <NotificationDropdown />
          </div>

          {/* 👤 Profile Dropdown */}
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="hidden md:flex items-center gap-2 bg-orange-100 text-orange-600 font-semibold px-3 py-2 rounded-full hover:bg-orange-200 transition"
          >
            <UserCircle size={22} />
            <span className="hidden md:inline-block text-gray-700 font-medium">
               Tobiloba
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {/* Dropdown (Desktop) */}
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
                  onClick={() =>
                    (window.location.href = "/profile")
                  }
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
        </div>
      </div>

      {/* 📱 Mobile Top Bar */}
          <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-100 flex justify-end items-center gap-4 px-4 py-3">
        {/** Notification Icon */}
        <NotificationDropdown />

        {/* ☰ Menu Icon */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg hover:bg-orange-50 transition"
        >
          {menuOpen ? (
            <X size={22} className="text-gray-700" />
          ) : (
            <Menu size={22} className="text-gray-700" />
          )}
        </button>
      </div>


      {/* 📱 Slide-In Mobile Sidebar */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 flex flex-col justify-between"
            >
              <div className="p-5 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-orange-500">
                    Loyalty CardX
                  </h2>
                  <button onClick={() => setMenuOpen(false)} className="p-2">
                    <X size={22} className="text-gray-700" />
                  </button>
                </div>

                <div className="flex justify-center">
                  <TierBadge tier="Gold" />
                </div>

                <nav className="space-y-4 text-gray-700 font-medium">
                  <ul className="space-y-2">
                    <li>
                      <Link href="/overview" className={linkClasses("/overview")}>
                        <Home className="mr-3" /> Overview
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/my-campaigns"
                        className={linkClasses("/my-campaigns")}
                      >
                        <Megaphone className="mr-3" /> My Campaigns
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/available-campaigns"
                        className={linkClasses("/available-campaigns")}
                      >
                        <Megaphone className="mr-3" /> Available Campaigns
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/wishlist"
                        className={linkClasses("/wishlist")}
                      >
                        <Heart className="mr-3" /> My Wishlist
                      </Link>
                    </li>
                    <li>
                      <Link href="/rewards" className={linkClasses("/rewards")}>
                        <HandCoins className="mr-3" /> My Rewards
                      </Link>
                    </li>
                    <li>
                      <Link href="/wallet" className={linkClasses("/wallet")}>
                        <Wallet className="mr-3" /> Wallet
                      </Link>
                    </li>
                    <li>
                      <Link href="/points" className={linkClasses("/points")}>
                        <Wallet className="mr-3" /> Points
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/redemption"
                        className={linkClasses("/redemption")}
                      >
                        <HandCoins className="mr-3" /> Redemption
                      </Link>
                    </li>
                    <li>
                        <Link
                          href="/support"
                          className={linkClasses("/support")}
                        >
                          <HelpCircle className="mr-3" /> Support
                        </Link>
                    </li>
                    <li>
                        <Link href="/account-security" className={linkClasses("/account-security")}>
                            <Shield className="mr-3" /> Account & Security
                        </Link>
                    </li>

                  </ul>
                </nav>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-gray-200 space-y-3">
                <button
                  onClick={() =>
                    (window.location.href = "/profile")
                  }
                  className="flex items-center gap-2 text-gray-700 hover:text-orange-600 w-full transition"
                >
                  <User size={18} /> Profile
                </button>
                <button
                  onClick={() => console.log("Logging out...")}
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600 w-full transition"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
