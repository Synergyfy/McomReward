"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCircle2,
  Trash2,
  Clock,
  Sparkles,
  Info,
  Gift,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const initialNotifications = [
  {
    id: "notif-1",
    title: "Points Credited Successfully",
    message: "You have been credited 250 points for scanning at Artisan Coffee House.",
    time: "2 hours ago",
    read: false,
    type: "POINTS"
  },
  {
    id: "notif-2",
    title: "Limited Offer Alert",
    message: "Weekend Sprint Campaign is ending in 2 days. Complete it now to get double points!",
    time: "1 day ago",
    read: false,
    type: "CAMPAIGN"
  },
  {
    id: "notif-3",
    title: "Gift Card Delivered",
    message: "Your £25 Brew & Co. Gift Card has been sent. Code: BREW-1102-4952-1924.",
    time: "3 days ago",
    read: true,
    type: "GIFT_CARD"
  }
];

export default function ParticipantNotificationsCenter() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 sm:py-8 px-2 sm:px-4 bg-[#f9fafb] text-gray-800 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 sm:pb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/participant/settings')}
            className="text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-all duration-200 shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
              Notification Center <Bell className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#f54900] shrink-0" />
            </h1>
            <p className="text-gray-550 font-medium text-xs sm:text-sm">Keep track of alerts, updates, and rewards delivery.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-950 text-xs font-bold rounded-xl shadow-sm transition-all duration-200"
            onClick={markAllAsRead}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {notifications.map((notif) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              key={notif.id}
              className={`bg-white rounded-3xl p-5 border border-gray-250 flex gap-4 hover:shadow-md transition-all relative overflow-hidden ${
                !notif.read ? "border-l-4 border-l-[#f54900]" : ""
              }`}
            >
              {/* Type Indicator Icon */}
              <div className="shrink-0">
                <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100 text-[#f54900]">
                  {notif.type === "POINTS" ? (
                    <Zap className="w-5 h-5 fill-current" />
                  ) : notif.type === "GIFT_CARD" ? (
                    <Gift className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold text-gray-900 text-base">{notif.title}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-gray-400 hover:text-red-500 hover:bg-red-50 -mt-1 -mr-2 rounded-full transition-colors"
                    onClick={() => deleteNotification(notif.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{notif.message}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-2">
                  <Clock size={10} />
                  <span>{notif.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
          {notifications.length === 0 && (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
              <div className="p-4 bg-gray-50 rounded-full inline-block mb-4 border border-gray-100">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-semibold">All caught up! No notifications.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
