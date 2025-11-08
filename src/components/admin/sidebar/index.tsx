'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Award, Briefcase, History, Megaphone, Lightbulb, Users, ChevronDown, SlidersHorizontal } from 'lucide-react'; // Import SlidersHorizontal

interface AdminSidebarProps {
  isOpen: boolean;
}

export default function AdminSidebar({ isOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  const linkClasses = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center p-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-orange-100 hover:text-orange-600'}`;
  };

  const parentLinkClasses = (basePath: string) => {
    const isActive = pathname.startsWith(basePath);
    return `flex items-center justify-between p-2 rounded-lg transition-colors duration-200 cursor-pointer ${isActive ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-orange-100 hover:text-orange-600'}`;
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
      <h2 className="text-2xl font-bold mb-6 text-orange-600">Admin Panel</h2>

      <ul className="space-y-2">
        <li>
          <Link href="/admin/dashboard" className={linkClasses("/admin/dashboard")}>
            <LayoutDashboard className="mr-3" />
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/admin/rewards" className={linkClasses("/admin/rewards")}>
            <Award className="mr-3" />
            Rewards
          </Link>
        </li>
        <li>
          {/* User Management Parent Link with Dropdown */}
          <div
            className={parentLinkClasses("/admin/users")}
            onClick={() => setIsUserManagementOpen(!isUserManagementOpen)}
          >
            <div className="flex items-center">
              <Users className="mr-3" />
              User Management
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isUserManagementOpen ? 'rotate-180' : ''}`} />
          </div>
          {isUserManagementOpen && (
            <ul className="ml-4 mt-1 space-y-1">
              <li>
                <Link href="/admin/users/business" className={linkClasses("/admin/users/business")}>
                  Business Owners
                </Link>
              </li>
              <li>
                <Link href="/admin/users/consumer" className={linkClasses("/admin/users/consumer")}>
                  Consumers
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <Link href="/admin/campaigns/list" className={linkClasses("/admin/campaigns/list")}>
            <Megaphone className="mr-3" />
            Campaigns
          </Link>
        </li>
        <li>
          <Link href="/admin/sectors" className={linkClasses("/admin/sectors")}>
            <Briefcase className="mr-3" />
            Sectors
          </Link>
        </li>
        <li>
          <Link href="/admin/points-log" className={linkClasses("/admin/points-log")}>
            <History className="mr-3" />
            Points Log
          </Link>
        </li>
        {/* New Matching Points Settings Link */}
        <li>
          <Link href="/admin/matching-points" className={linkClasses("/admin/matching-points")}>
            <SlidersHorizontal className="mr-3" />
            Matching Points Settings
          </Link>
        </li>
        <li>
          <Link href="/admin/wishlist-insights" className={linkClasses("/admin/wishlist-insights")}>
            <Lightbulb className="mr-3" />
            Wishlist Insights
          </Link>
        </li>
      </ul>
    </div>
  );
}