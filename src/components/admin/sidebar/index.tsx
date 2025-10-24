
'use client';



import React from 'react';

import Link from 'next/link';

import { usePathname } from 'next/navigation';

import { LayoutDashboard, Award, Briefcase } from 'lucide-react';



interface AdminSidebarProps {

  isOpen: boolean;

}



export default function AdminSidebar({ isOpen }: AdminSidebarProps) {

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

          <Link href="/admin/sectors" className={linkClasses("/admin/sectors")}>

            <Briefcase className="mr-3" />

            Sectors

          </Link>

        </li>

      </ul>

    </div>

  );

}
