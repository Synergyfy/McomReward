'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminParticipantDetails } from '@/services/admin/hook';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Customer layout components
import CustomerSidebar from '@/components/customer/sidebar';
import ModernHeader from '@/components/customer/ModernHeader';
import { ParticipantProfileResponse, ParticipantGlobalBalanceResponse } from '@/services/customer-campaigns/types';

export default function AdminConsumerLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: user, isLoading: isUserLoading } = useAdminParticipantDetails(id);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="text-red-500 mb-4">User not found</div>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  // Map Admin User data to Customer Profile format for the Header
  const profile: ParticipantProfileResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: 'consumer',
    uniqueCode: 'N/A',
    globalTotalPoints: user.globalTotalPoints,
    matchingPoints: user.matchingPoints,
    pointUtilization: 0,
    totalPointsEarned: 0,
    totalPointsRedeemed: user.rewardsRedeemed,
    isDisabled: false,
    createdAt: user.joinedDate,
    updatedAt: new Date().toISOString(),
    campaignBalances: []
  };

  const balanceData: ParticipantGlobalBalanceResponse = {
    globalTotalPoints: user.globalTotalPoints,
    matchingPoints: user.matchingPoints,
    campaignBalances: []
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-gray-50">
      <div className="relative min-h-screen md:flex bg-gray-50">

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Customer Sidebar (Impersonated) */}
        <CustomerSidebar isOpen={isSidebarOpen} basePath={`/admin/users/consumer/${id}`} />

        {/* Main Content Area */}
        <div className="flex-1 md:ml-64 transition-all duration-300">

          {/* Header (Impersonated) */}
          <ModernHeader
            onMenuClick={toggleSidebar}
            profile={profile}
            balanceData={balanceData}
            isLoading={isUserLoading}
          />

          <main className="p-4 sm:p-6 md:p-10">
            {/* Back Button for Admin Context - ALWAYS VISIBLE */}
            <div className="mb-6 flex items-center justify-between sticky top-0 z-20 bg-gray-50 py-2 border-b border-gray-200">
              <Button variant="outline" onClick={() => router.push('/admin/users/consumer')} className="hover:bg-gray-200">
                <ArrowLeft className="mr-2 h-4 w-4" /> Exit User View
              </Button>
              <div className="text-sm text-gray-500 italic">
                Viewing as {user.name}
              </div>
            </div>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
