'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Wallet, Megaphone } from 'lucide-react';

interface CustomerSidebarProps {
  isOpen: boolean;
}

export default function CustomerSidebar({ isOpen }: CustomerSidebarProps) {
  return (
    <div
      className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-5 z-40
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <h2 className="text-lg font-semibold mb-5">Menu</h2>
      <ul>
        <li className="mb-2">
          <Link href="/" className="flex items-center hover:text-primary">
            <Home className="mr-2" />
            Home
          </Link>
        </li>
        <li className="mb-2">
          <Link href="/campaigns" className="flex items-center hover:text-primary">
            <Megaphone className="mr-2" />
            Campaigns
          </Link>
        </li>
        <li className="mb-2">
          <Link href="/wallet" className="flex items-center hover:text-primary">
            <Wallet className="mr-2" />
            Wallet
          </Link>
        </li>
      </ul>
    </div>
  );
}
