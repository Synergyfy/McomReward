
import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Award, Briefcase } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  return (
    <div className={`
      fixed h-screen w-64 bg-gray-900 text-white p-5 z-50 overflow-y-auto
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0 md:block
    `}>
      <h2 className="text-lg font-semibold mb-5">Admin Menu</h2>
      <ul>
        <li className="mb-2">
          <Link href="/admin/dashboard" className="flex items-center hover:text-primary">
            <LayoutDashboard className="mr-2" />
            Dashboard
          </Link>
        </li>
        {/* <li className="mb-2"><Link href="/admin/users" className="hover:text-primary">Users</Link></li> */}
        <li className="mb-2">
          <Link href="/admin/rewards" className="flex items-center hover:text-primary">
            <Award className="mr-2" />
            Rewards
          </Link>
        </li>
        <li className="mb-2">
          <Link href="/admin/sectors" className="flex items-center hover:text-primary">
            <Briefcase className="mr-2" />
            Sectors
          </Link>
        </li>
        {/* <li className="mb-2"><Link href="/admin/settings" className="hover:text-primary">Settings</Link></li> */}
      </ul>
    </div>
  );
}