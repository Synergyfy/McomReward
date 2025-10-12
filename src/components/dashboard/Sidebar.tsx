"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, UserPlus } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname() || '';

  const staffLinks = [
    { href: '/dashboard/staff/all', label: 'All Staff', icon: <Users /> },
    { href: '/dashboard/staff/add', label: 'Add Staff', icon: <UserPlus /> },
  ];

  return (
    <div className="w-64 h-full bg-white shadow-md">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-orange-600">Dashboard</h2>
      </div>
      <nav className="mt-6">
        <div>
          <span className="px-6 text-sm font-bold text-gray-500">Staff</span>
          <ul className="mt-2">
            {staffLinks.map(({ href, label, icon }) => (
              <li key={href}>
                <Link href={href}>
                  <p className={`flex items-center px-6 py-3 text-gray-700 hover:bg-orange-100 hover:text-orange-600 ${pathname.startsWith(href) ? 'bg-orange-200 text-orange-700' : ''}`}>
                    <span className="mr-3">{icon}</span>
                    {label}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
