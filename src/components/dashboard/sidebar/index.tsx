'use client';

import React, { useState } from 'react';
import Link from 'next/link';
// import { Award, Megaphone, UserCheck, Trophy, ChevronDown, ChevronUp, Users  } from 'lucide-react';
import { useLinkClasses } from '@/app/hooks';
// import { usePathname } from 'next/navigation';
import { Award, Megaphone, Heart, Users, Ticket, Trophy} from 'lucide-react';

interface BusinessSidebarProps {
  isOpen: boolean;
}

export default function BusinessSidebar({ isOpen }: BusinessSidebarProps) {
  const [isStaffOpen, setIsStaffOpen] = useState(true);
  const linkClasses = useLinkClasses();



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
          <Link href="/dashboard" className={linkClasses("/dashboard", true)}>
            <Award className="mr-3" />
           Dashboard
          </Link>
        </li>
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
         <li>
          <Link href="/dashboard/campaign-performance" className={linkClasses("/dashboard/campaign-performance")}>
            <Trophy className="mr-3" />
            Campaign Performance
          </Link>
        </li>

       <li>
          <button
            className={linkClasses("/dashboard/staff")}
          >
            <span className="flex items-center">
              <Users className="mr-3" />
              Staff Management
            </span>
           
          </button>

          {/* Dropdown items */}
          {isStaffOpen && (
            <ul className="ml-8 mt-2 space-y-1">
              <li>
                <Link
                  href="/dashboard/staff"
                  className={linkClasses("/dashboard/staff", true)}
                >
                  View Staff
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/staff/add"
                  className={linkClasses("/dashboard/staff/add", true)}
                >
                  Add Staff
                </Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}
