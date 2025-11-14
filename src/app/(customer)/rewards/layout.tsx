// app/(customer)/dashboard/rewards/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Redeem Rewards", path: "/rewards" },
    { name: "My Claimed Rewards", path: "/rewards/claimed" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="flex gap-4 p-6 border-b bg-orange-50">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.path}
            className={cn(
              "px-4 py-2 rounded-full font-medium text-sm transition-all",
              pathname === tab.path
                ? "bg-orange-500 text-white shadow-sm"
                : "text-gray-700 hover:bg-orange-100"
            )}
          >
            {tab.name}
          </Link>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}
