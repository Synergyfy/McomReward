'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Megaphone, Heart, Settings,  HandCoins, HelpCircle, Shield } from 'lucide-react';

interface CustomerSidebarProps {
  isOpen: boolean;
}

export default function CustomerSidebar({ isOpen }: CustomerSidebarProps) {
  const pathname = usePathname();

  const linkClasses = (path: string) => {
    const isActive = pathname === path;
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
      <h2 className="text-2xl font-bold mb-6 text-orange-600">Menu</h2>
      <ul className="space-y-2">
        <li>
          <Link href="/overview" className={linkClasses("/overview")}>
            <Home className="mr-3" />
          Overview
          </Link>
        </li>
        <li className="mb-2">
          <Link href="/my-campaigns" className={linkClasses("/my-campaigns")}>
            <Megaphone className="mr-3" />
            My Campaigns
          </Link>
        </li>
           <li className="mb-2">
          <Link href="/available-campaigns" className={linkClasses("/available-campaigns")}>
            <Megaphone className="mr-3" />
            Available Campaigns
          </Link>
        </li>
        <li className="mb-2">
          <Link href="/wishlist" className={linkClasses("/wishlist")}>
            <Heart className="mr-3" />
          My Wishlist
          </Link>
        </li>
        <li className="mb-2">
          <Link href="/rewards" className={linkClasses("/rewards")}>
            <HandCoins className="mr-3" />
            My Rewards
          </Link>
        </li>
        <li className="mb-2">
          <Link href="/wallet" className={linkClasses("/wallet")}>
            <Wallet className="mr-3" />
            Wallet
          </Link>
        </li>
        {/* <li className="mb-2">
          <Link href="/points" className={linkClasses("/points")}>
            <Wallet className="mr-3" />
            Point
          </Link>
        </li> */}
        <li className="mb-2">
          <Link href="/redemption" className={linkClasses("/redemption")}>
            <HandCoins className="mr-3" />
            Redemption
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
    </div>
  );
}
