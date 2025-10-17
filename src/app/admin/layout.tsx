
import Sidebar from '@/components/admin/sidebar';
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 p-10 bg-gray-100 ml-64">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
