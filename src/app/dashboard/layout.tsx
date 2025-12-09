'use client';

import BusinessSidebar from '@/components/dashboard/sidebar/index';
import BusinessHeader from '@/components/dashboard/header';
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { GuideProvider } from '@/context/GuideContext';
import FloatingGuide from '@/components/Guide/FloatingGuide';
import { usePathname, useRouter } from 'next/navigation';
import { useGetBusinessSubscription } from '@/services/tiers/hook';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: subscription, isLoading } = useGetBusinessSubscription();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    if (!isLoading && subscription?.tier === 'Free') {
      if (!pathname.includes('/dashboard/subscription')) {
        router.push('/dashboard/subscription');
      }
    }
  }, [subscription, isLoading, pathname, router]);


  return (
    <GuideProvider>
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
          <main className="p-4 mt-4 sm:p-6 md:p-10">
            {children}
          </main>
        </div>

        <FloatingGuide />
      </div>
    </GuideProvider>
  );
}
