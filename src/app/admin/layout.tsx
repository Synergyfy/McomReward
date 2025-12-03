'use client';

import AdminSidebar from '@/components/admin/sidebar';
import AdminHeader from '@/components/admin/header';
import React, { useState } from 'react';
import { GuideProvider } from '@/context/GuideContext';
import FloatingGuide from '@/components/Guide/FloatingGuide';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <GuideProvider>
      <div className="min-h-screen md:flex">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Sidebar */}
        <AdminSidebar isOpen={isSidebarOpen} />

        {/* Main content */}
        <div className="flex-1 md:ml-64">
          {/* Header */}
          <AdminHeader onMenuClick={toggleSidebar} />
          <main className="p-4 sm:p-6 md:p-10">
            {children}
          </main>
          <FloatingGuide />
        </div>
      </div>
    </GuideProvider>
  );
}