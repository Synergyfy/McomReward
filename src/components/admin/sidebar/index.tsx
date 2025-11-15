'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Award, Briefcase, History, Megaphone, Lightbulb, Users, ChevronDown, SlidersHorizontal, Tag, Handshake, Bell, BarChart, QrCode, DollarSign, ShoppingCart, ShieldHalf, BookCopy, PieChart, CircleDollarSign } from 'lucide-react'; // Import QrCode for Plaque Management, DollarSign and ShoppingCart for Sales Management

interface AdminSidebarProps {
  isOpen: boolean;
}

export default function AdminSidebar({ isOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isPlaqueManagementOpen, setIsPlaqueManagementOpen] = useState(false);
  const [isSalesManagementOpen, setIsSalesManagementOpen] = useState(false); // State for Sales Management dropdown

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
        fixed top-0 left-0 h-full w-64 bg-white text-gray-800 z-40 shadow-lg
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}
    >
      <div className="p-4 pb-6">
        <h2 className="text-2xl font-bold text-orange-600">Admin Panel</h2>
      </div>

      <ul className="space-y-2 px-4 pb-4 overflow-y-auto flex-1">
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
        <li>
          <Link href="/admin/matching-points" className={linkClasses("/admin/matching-points")}>
            <SlidersHorizontal className="mr-3" />
            Matching Points Settings
          </Link>
        </li>
        <li>
          <Link href="/admin/tier-badge-control" className={linkClasses("/admin/tier-badge-control")}>
            <Award className="mr-3" />
            Tier & Badge Control
          </Link>
        </li>
        <li>
          <Link href="/admin/deals-management" className={linkClasses("/admin/deals-management")}>
            <Tag className="mr-3" />
            Deals Management
          </Link>
        </li>
        <li>
          <Link href="/admin/partner-management" className={linkClasses("/admin/partner-management")}>
            <Handshake className="mr-3" />
            Partner Management
          </Link>
        </li>
        <li>
          <Link href="/admin/notifications-control" className={linkClasses("/admin/notifications-control")}>
            <Bell className="mr-3" />
            Notifications Control
          </Link>
        </li>
        <li>
          <Link href="/admin/reporting-analytics" className={linkClasses("/admin/reporting-analytics")}>
            <BarChart className="mr-3" />
            Reporting & Analytics
          </Link>
        </li>
        {/* Plaque Management Parent Link with Dropdown */}
        <li>
          <div
            className={parentLinkClasses("/admin/plaques")}
            onClick={() => setIsPlaqueManagementOpen(!isPlaqueManagementOpen)}
          >
            <div className="flex items-center">
              <QrCode className="mr-3" />
              Plaque Management
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isPlaqueManagementOpen ? 'rotate-180' : ''}`} />
          </div>
          {isPlaqueManagementOpen && (
            <ul className="ml-4 mt-1 space-y-1">
              <li>
                <Link href="/admin/plaques/create" className={linkClasses("/admin/plaques/create")}>
                  Create Plaque
                </Link>
              </li>
              <li>
                <Link href="/admin/plaques/list" className={linkClasses("/admin/plaques/list")}>
                  Plaque List
                </Link>
              </li>
              <li>
                <Link href="/admin/plaques/analytics" className={linkClasses("/admin/plaques/analytics")}>
                  Plaque Analytics
                </Link>
              </li>
            </ul>
          )}
        </li>
        {/* Sales Management Parent Link with Dropdown */}
        <li>
          <div
            className={parentLinkClasses("/admin/sales")}
            onClick={() => setIsSalesManagementOpen(!isSalesManagementOpen)}
          >
            <div className="flex items-center">
              <ShoppingCart className="mr-3" />
              Sales Management
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isSalesManagementOpen ? 'rotate-180' : ''}`} />
          </div>
          {isSalesManagementOpen && (
            <ul className="ml-4 mt-1 space-y-1">
              <li>
                <Link href="/admin/sales/sell-plaque" className={linkClasses("/admin/sales/sell-plaque")}>
                  Sell Plaque
                </Link>
              </li>
              <li>
                <Link href="/admin/sales/dashboard" className={linkClasses("/admin/sales/dashboard")}>
                  Sales Dashboard
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <Link href="/admin/wishlist-insights" className={linkClasses("/admin/wishlist-insights")}>
            <Lightbulb className="mr-3" />
            Wishlist Insights
          </Link>
        </li>
        <li>
          <Link href="/admin/financials" className={linkClasses("/admin/financials")}>
            <CircleDollarSign className="mr-3" />
            Financials
          </Link>
        </li>
        <li>
          <Link href="/admin/resources" className={linkClasses("/admin/resources")}>
            <BookCopy className="mr-3" />
            Resources
          </Link>
        </li>
        <li>
          <Link href="/admin/security" className={linkClasses("/admin/security")}>
            <ShieldHalf className="mr-3" />
            Security
          </Link>
        </li>
        <li>
          <Link href="/admin/summary" className={linkClasses("/admin/summary")}>
            <PieChart className="mr-3" />
            Summary
          </Link>
        </li>
      </ul>
    </div>
  );
}
