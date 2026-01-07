'use client';

import BusinessSidebar from '@/components/dashboard/sidebar/index';
import BusinessHeader from '@/components/dashboard/header';
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { GuideProvider } from '@/context/GuideContext';
import FloatingGuide from '@/components/Guide/FloatingGuide';
import { usePathname, useRouter } from 'next/navigation';
import { useGetBusinessSubscription, useGetMySubscription } from '@/services/tiers/hook';
import TrialBanner from '@/components/dashboard/trial-banner';
import { useImpersonation } from '@/context/ImpersonationContext';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isImpersonating, businessId, stopImpersonation } = useImpersonation();
  const { data: businessSubscription, isLoading: isBusinessSubLoading } = useGetBusinessSubscription();
  const { data: mySubscription, isLoading: isMySubLoading } = useGetMySubscription();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  useEffect(() => {
    // Check if subscription data is loaded and tier is Free
    if (!isBusinessSubLoading && businessSubscription?.tier === 'Free') {
      // Prevent redirect loop if already on subscription page
      if (!pathname.includes('/dashboard/subscription')) {
        // Ensure we don't redirect if we are in a potentially transient state or just paid
        // But since we invalidated queries on checkout success, this 'Free' check should be accurate.
        router.push('/dashboard/subscription');
      }
    }
  }, [businessSubscription, isBusinessSubLoading, pathname, router]);


  return (
    <GuideProvider>
      <div className="relative min-h-screen md:flex flex-col md:flex-row">

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Sidebar */}
        <BusinessSidebar
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={toggleCollapse}
        />

        {/* Main content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>

          {/* Impersonation Banner */}
          {isImpersonating && (
            <div className="bg-amber-100 border-b border-amber-200 px-4 py-3 flex items-center justify-between text-amber-900 sticky top-0 z-40">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Eye className="h-4 w-4" />
                <span>You are currently viewing as Business ID: <strong>{businessId}</strong></span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={stopImpersonation}
                className="h-8 gap-1"
              >
                <X className="h-4 w-4" />
                Exit View
              </Button>
            </div>
          )}

          {/* Trial Banner - Show if is trial or for demo purposes if nothing else */}
          {mySubscription?.isTrial && mySubscription.expiresAt && (
            <TrialBanner
              planName={mySubscription.tier?.name || 'Pro'}
              expiresAt={mySubscription.expiresAt}
            />
          )}

          {/* Header for mobile */}
          <BusinessHeader onMenuClick={toggleSidebar} />
          <main className="p-4 mt-4 sm:p-6 md:p-10 flex-1">
            {children}
          </main>
        </div>

        <FloatingGuide />
      </div>
    </GuideProvider>
  );
}
