import React from 'react';
import Link from 'next/link';
import { Award, Megaphone, UserCheck } from 'lucide-react';

interface BusinessSidebarProps {
  isOpen: boolean;
}

export default function BusinessSidebar({ isOpen }: BusinessSidebarProps) {
  return (
    <div
      className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-5 z-40
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <h2 className="text-lg font-semibold mb-5">Business Menu</h2>
      <ul>
        <li className="mb-2">
          <Link href="/dashboard/rewards" className="flex items-center hover:text-primary">
            <Award className="mr-2" />
            Rewards
          </Link>
        </li>
        <li className="mb-2">
          <Link href="/dashboard/campaigns" className="flex items-center hover:text-primary">
            <Megaphone className="mr-2" />
            Campaigns
          </Link>
        </li>
        <li className="mb-2">
          <Link href="/dashboard/campaign-access" className="flex items-center hover:text-primary">
            <UserCheck className="mr-2" />
            Campaign Access
          </Link>
        </li>
      </ul>
    </div>
  );
}
