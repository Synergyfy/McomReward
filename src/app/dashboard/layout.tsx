'use client';

import BusinessSidebar from '@/components/dashboard/sidebar';
import BusinessHeader from '@/components/dashboard/header';
import React, { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <html lang="en">
      <body>
        <div className="relative min-h-screen md:flex">
          {/* Mobile overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={toggleSidebar}
            ></div>
          )}

          {/* Sidebar */}
          <BusinessSidebar isOpen={isSidebarOpen} />

          {/* Main content */}
          <div className="flex-1 md:ml-64">
            {/* Header for mobile */}
            <BusinessHeader onMenuClick={toggleSidebar} />
            <main className="p-4 sm:p-6 md:p-10">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
