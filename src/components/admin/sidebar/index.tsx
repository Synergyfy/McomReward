
import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Award, Briefcase } from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
}

export default function AdminSidebar({ isOpen }: AdminSidebarProps) {
  return (
    <div
      className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-5 z-40
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
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