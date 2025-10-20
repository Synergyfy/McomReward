
"use client";

import Sidebar from '@/components/admin/sidebar';
import AdminHeader from '@/components/admin/header';
import React, { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <html lang="en">
      <body>
        {/* Mobile Header */}
        <AdminHeader onMenuClick={toggleSidebar} />

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
            onClick={toggleSidebar}
          />
        )}

        <div className="flex h-screen">
          <Sidebar isOpen={isSidebarOpen} />
          <div 
            className={`flex-1 p-10 bg-gray-100 transition-all duration-300 ease-in-out ${
              isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-64'
            }`}
          >
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}