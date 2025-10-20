import BusinessSidebar from '@/components/dashboard/sidebar';
import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen">
          <BusinessSidebar />
          <div className="flex-1 p-10 bg-gray-100 ml-64">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
