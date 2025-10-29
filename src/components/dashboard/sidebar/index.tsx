'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, Megaphone, Heart, Users, Ticket } from 'lucide-react';

interface BusinessSidebarProps {
  isOpen: boolean;
}

export default function BusinessSidebar({ isOpen }: BusinessSidebarProps) {
  const pathname = usePathname();

  const linkClasses = (path: string) => {
    const isActive = pathname.startsWith(path);
    return `flex items-center p-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-orange-100 hover:text-orange-600'}`;
  };

  return (
    <div
      className={`
        fixed top-0 left-0 h-full w-64 bg-white text-gray-800 p-4 z-40 shadow-lg
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <h2 className="text-2xl font-bold mb-6 text-orange-600">Business Menu</h2>
      <ul className="space-y-2">
        <li>
          <Link href="/dashboard/rewards" className={linkClasses("/dashboard/rewards")}>
            <Award className="mr-3" />
            Rewards
          </Link>
        </li>
        <li>
          <Link href="/dashboard/campaigns/list" className={linkClasses("/dashboard/campaigns/list")}>
            <Megaphone className="mr-3" />
            Campaigns
          </Link>
        </li>
        <li>
          <Link href="/dashboard/wishlist-insights" className={linkClasses("/dashboard/wishlist-insights")}>
            <Heart className="mr-3" />
            Wishlist Insights
          </Link>
        </li>
        <li>
          <Link href="/dashboard/affiliate" className={linkClasses("/dashboard/affiliate")}>
            <Users className="mr-3" />
            Affiliate
          </Link>
        </li>
        <li>
          <Link href="/dashboard/deals" className={linkClasses("/dashboard/deals")}>
            <Ticket className="mr-3" />
            Deals
          </Link>
        </li>
        <li>
          {/* <Link href="/dashboard/campaign-access" className={linkClasses("/dashboard/campaign-access")}>
            <UserCheck className="mr-3" />
            Campaign Access
          </Link> */}
        </li>
      </ul>
    </div>
  );
}
