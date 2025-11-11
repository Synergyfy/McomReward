// app/(customer)/components/NotificationCard.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Bell, Gift, Star, ListCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NotificationCardProps {
  notification: {
    id: number;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  };
  onRead?: (id: number) => void;
}

export default function NotificationCard({ notification, onRead }: NotificationCardProps) {
  const icons: Record<string, React.ReactElement> = {
    campaign: <Sparkles className="w-4 h-4 text-orange-500" />,
    reward: <Gift className="w-4 h-4 text-pink-500" />,
    wishlist: <ListCheck className="w-4 h-4 text-blue-500" />,
    activity: <Star className="w-4 h-4 text-yellow-500" />,
    default: <Bell className="w-4 h-4 text-gray-400" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border shadow-sm transition-all cursor-pointer hover:shadow-md",
        notification.read ? "bg-white border-gray-100" : "bg-orange-50 border-orange-100"
      )}
      onClick={() => onRead?.(notification.id)}
    >
      <div className="mt-1">{icons[notification.type] || icons.default}</div>

      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 text-sm">{notification.title}</h3>
        <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
        <span className="text-[11px] text-gray-400 mt-2 block">
          {new Date(notification.timestamp).toLocaleString()}
        </span>
      </div>

      {!notification.read && <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />}
    </motion.div>
  );
}
