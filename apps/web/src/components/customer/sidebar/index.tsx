'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, Megaphone, Heart, Settings, HandCoins, Stamp, Ticket, Trophy, Zap, Store, Gift, MapPin, CreditCard, Home } from 'lucide-react';

interface CustomerSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  activePath?: string;
  basePath?: string;
}

export default function CustomerSidebar({ isOpen, onClose, activePath, basePath = '' }: CustomerSidebarProps) {
  const pathname = usePathname();
  const currentPath = activePath || pathname;

  const linkClasses = (path: string) => {
    // If we have a basePath (e.g., /admin/users/consumer/123), check if currentPath starts with basePath + path
    // OR if we are in customer view, check exact match or starts with.
    // Simplifying: construct the full target path.
    const fullPath = `${basePath}${path}`;

    // Check if the current path matches the target path. For root path, use exact match to avoid matching all sub-routes.
    const isActive = path === "" 
      ? currentPath === fullPath
      : currentPath === fullPath || currentPath?.startsWith(fullPath + '/');

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
      <Link href={`${basePath || '/participant'}`} onClick={onClose}>
        <h2 className="text-2xl font-bold mb-6 text-orange-600 tracking-tighter cursor-pointer hover:opacity-80 transition-opacity">M-Com Rewards</h2>
      </Link>
      <ul className="space-y-2">
        <li className="mb-2">
          <Link href={`${basePath}`} className={linkClasses("")} onClick={onClose}>
            <Home className="mr-3 text-orange-600" />
            Home Page
          </Link>
        </li>
        <li className="mb-2">
          <Link href={`${basePath}/wallet`} className={linkClasses("/wallet")} onClick={onClose}>
            <Wallet className="mr-3 text-blue-500" />
            My Wallet
          </Link>
        </li>
        <li className="mb-2">
          <Link href={`${basePath}/gift-cards`} className={linkClasses("/gift-cards")} onClick={onClose}>
            <CreditCard className="mr-3 text-orange-600" />
            My Gift Cards
          </Link>
        </li>
        <li className="mb-2">
          <Link href={`${basePath}/market`} className={linkClasses("/market")} onClick={onClose}>
            <Store className="mr-3 text-orange-500" />
            Marketplace Hub
          </Link>
        </li>
        <li className="mb-2">
          <Link href={`${basePath}/credits`} className={linkClasses("/credits")} onClick={onClose}>
            <Zap className="mr-3 text-yellow-500 fill-yellow-500" />
            Credits & Rewards
          </Link>
        </li>
        <li className="mb-2">
          <Link href={`${basePath}/progression`} className={linkClasses("/progression")} onClick={onClose}>
            <Trophy className="mr-3 text-amber-500" />
            My Progression
          </Link>
        </li>
        <li className="mb-2">
          <Link href={`${basePath}/mall-rewards`} className={linkClasses("/mall-rewards")} onClick={onClose}>
            <Ticket className="mr-3" />
            My Mall Rewards
          </Link>
        </li>
        <li className="mb-2">
          <Link href={`${basePath}/my-campaigns`} className={linkClasses("/my-campaigns")} onClick={onClose}>
            <Megaphone className="mr-3" />
            My Campaigns
          </Link>
        </li>
        <li className="mb-2">
          <Link href={`${basePath}/wishlist`} className={linkClasses("/wishlist")} onClick={onClose}>
            <Heart className="mr-3" />
            My Wishlist
          </Link>
        </li>
        <li className="mb-2">
          <Link href={`${basePath}/stamp-rewards`} className={linkClasses("/stamp-rewards")} onClick={onClose}>
            <Stamp className="mr-3" />
            Stamp Rewards
          </Link>
        </li>
        <li className="mb-2">
          <Link href={`${basePath}/redemption`} className={linkClasses("/redemption")} onClick={onClose}>
            <HandCoins className="mr-3" />
            Redemption
          </Link>
        </li>
        <li className="mt-8">
          <Link href={`${basePath}/settings`} className={linkClasses("/settings")} onClick={onClose}>
            <Settings className="mr-3" />
            Settings
          </Link>
        </li>
      </ul>
    </div>
  );
}
