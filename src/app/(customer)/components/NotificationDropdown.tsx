// app/(customer)/components/NotificationDropdown.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import NotificationCard from "@/app/(customer)/components/NotificationCard";
import { DEMO_NOTIFICATIONS } from "@/app/(customer)/data/customerDemoData";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="relative">
      {/* 🔔 Bell Icon with badge */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-orange-50 transition"
      >
        <Bell className="text-gray-700 w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 💻 Dropdown (Desktop view) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="hidden md:block absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl border border-gray-100 z-[1000]"
          >
            <div className="p-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700">
                Notifications
              </h3>
              <button
                onClick={() =>
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                }
                className="text-xs text-orange-500 hover:underline"
              >
                Mark all read
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 space-y-2">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    onRead={markAsRead}
                  />
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">
                  🎉 No new notifications
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📱 Mobile slide-in panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={() => setOpen(false)}
            />
            {/* Slide Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-4 flex justify-between items-center border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="text-sm text-gray-500 hover:text-orange-600"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <NotificationCard
                      key={n.id}
                      notification={n}
                      onRead={markAsRead}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-500 mt-10">
                    🎉 You&apos;re all caught up!
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
