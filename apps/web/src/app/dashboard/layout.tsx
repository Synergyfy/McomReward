'use client';

import BusinessSidebar from '@/components/dashboard/sidebar/index';
import BusinessHeader from '@/components/dashboard/header';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { GuideProvider } from '@/context/GuideContext';
import FloatingGuide from '@/components/Guide/FloatingGuide';
import { usePathname, useRouter } from 'next/navigation';
import { useGetMySubscription } from '@/services/tiers/hook';
import { useGetMyPackage } from '@/services/mcom-packages';
import { useGetBusinessProfile } from '@/services/business/hook';
import TrialBanner, { OnboardingReminderBanner } from '@/components/dashboard/trial-banner';
import { useGetLoyaltySetupProgress } from '@/services/loyalty-setup/hook';
import { useImpersonation } from '@/context/ImpersonationContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Gift, Megaphone, Users, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import { clearLocalBusinessPreview, isLocalBusinessPreviewEnabled } from '@/lib/local-business-preview';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLocalBusinessPreview, setIsLocalBusinessPreview] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isImpersonating, businessId, participantId, stopImpersonation } = useImpersonation();
  // LOCAL-FIRST gating: Rewards DB membership via my-package (planVariant)
  // + my-membership. Central /business/subscription is never consulted.
  const { data: myPackage, isLoading: isMyPackageLoading } = useGetMyPackage();
  const { data: mySubscription, isLoading: isMySubLoading } = useGetMySubscription();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const { data: profile, isLoading: isProfileLoading } = useGetBusinessProfile();
  const { data: loyaltySetupProgress } = useGetLoyaltySetupProgress();
  const hasSkippedRewardsSetup = Boolean(
    loyaltySetupProgress?.hasSkippedOnboarding && !loyaltySetupProgress.hasCompletedSetup,
  );

  useEffect(() => {
    if (isLocalBusinessPreviewEnabled()) {
      setIsLocalBusinessPreview(true);
      return;
    }

    const bypassSso = process.env.NEXT_PUBLIC_BYPASS_SSO === "true";
    if (bypassSso) return; // Skip all auth checks in bypass mode

    // Role-based access control
    const role = localStorage.getItem('userRole');
    if (role === 'Participant') {
      toast.error('Unauthorized Access', {
        description: 'Business dashboard is restricted to business accounts only.'
      });
      router.push('/participant/wallet');
      return;
    }

    // Check if subscription data is loaded and is inactive/expired, but SKIP for Super Business
    const isTrial = Boolean(
      myPackage?.isTrial ||
        mySubscription?.isTrial ||
        myPackage?.accessType === 'TRIAL_PROGRAMME',
    );

    const hasEntitledAccess = Boolean(
      myPackage?.hasAccess === true ||
        myPackage?.accessPass?.hasAccess === true ||
        isTrial ||
        myPackage?.accessType === 'PAID_MEMBERSHIP' ||
        myPackage?.accessType === 'DIRECT_PACKAGE' ||
        myPackage?.accessType === 'ACCESS_PASS' ||
        mySubscription?.status === 'active',
    );

    const isSubInactive =
      !hasEntitledAccess &&
      (myPackage?.membershipStatus === 'expired' ||
        myPackage?.isExpired ||
        mySubscription?.status === 'expired');

    if (
      !isMyPackageLoading &&
      !isProfileLoading &&
      isSubInactive &&
      !profile?.isSuperBusiness
    ) {
      if (
        !pathname.includes('/dashboard/subscription') &&
        !pathname.includes('/dashboard/access-pass')
      ) {
        router.push('/dashboard/access-pass');
      }
    }
  }, [myPackage, mySubscription, isMyPackageLoading, pathname, router, profile, isProfileLoading]);


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
          onNavClick={() => setIsSidebarOpen(false)}
        />

        {/* Main content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>

          {/* Impersonation Banner */}
          {isImpersonating && (
            <div className="bg-amber-100 border-b border-amber-200 px-4 py-3 flex items-center justify-between text-amber-900 sticky top-0 z-40">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Eye className="h-4 w-4" />
                <span>
                  You are currently viewing as {businessId ? 'Business' : 'Participant'} ID: <strong>{businessId || participantId}</strong>
                </span>
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

          {isLocalBusinessPreview && (
            <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-950">
              <span><strong>Local dashboard preview.</strong> Payment and account entitlements have not been verified or changed.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearLocalBusinessPreview();
                  setIsLocalBusinessPreview(false);
                  router.replace('/dashboard/subscription');
                }}
                className="h-8 border-amber-400 bg-white"
              >
                Exit preview
              </Button>
            </div>
          )}

          {/* Trial Banner - Task-Gated Trial from MCOM Central or local subscription trial */}
          {hasSkippedRewardsSetup ? (
            <OnboardingReminderBanner />
          ) : (myPackage?.isTrial || mySubscription?.isTrial) &&
            (myPackage?.expiresAt || mySubscription?.expiresAt) && (
              <TrialBanner
                planName={
                  myPackage?.planName ||
                  mySubscription?.tier?.name ||
                  'Programme Trial'
                }
                expiresAt={(myPackage?.expiresAt || mySubscription?.expiresAt)!}
                tasks={myPackage?.trialTasks || []}
                upgradeUrl={myPackage?.upgradeUrl}
              />
            )}


          {/* Header for mobile */}
          <BusinessHeader onMenuClick={toggleSidebar} />
          <main className="p-4 mt-4 sm:p-6 md:p-10 flex-1 pb-20 md:pb-10">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-around h-16 px-2">
            {[
              { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
              { href: '/dashboard/stamp-rewards', label: 'Rewards', icon: Gift },
              { href: '/dashboard/campaigns/list', label: 'Campaigns', icon: Megaphone },
              { href: '/dashboard/customers', label: 'Customers', icon: Users },
            ].map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-0 flex-1 ${
                    isActive ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-orange-50' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-orange-500 mt-0.5" />}
                </Link>
              );
            })}
          </div>
        </nav>

        <FloatingGuide />
      </div>
    </GuideProvider>
  );
}
