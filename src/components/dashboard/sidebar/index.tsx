import React from 'react';
import Link from 'next/link';
import { Award, Megaphone, UserCheck } from 'lucide-react';

export default function BusinessSidebar() {
  return (
    <div className="fixed h-screen w-64 bg-gray-900 text-white p-5 z-50 overflow-y-auto">
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
