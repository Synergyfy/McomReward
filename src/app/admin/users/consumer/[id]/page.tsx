'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminParticipantDetails, useAdminParticipantHistory } from '@/services/admin/hook';
import { PointsBalanceDisplay } from '@/components/customer/PointsBalanceDisplay';
import { TransactionHistoryTable } from '@/components/customer/TransactionHistoryTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Customer layout components
import CustomerSidebar from '@/components/customer/sidebar';
import ModernHeader from '@/components/customer/ModernHeader';
import { ParticipantProfileResponse, ParticipantGlobalBalanceResponse } from '@/services/customer-campaigns/types';

export default function ConsumerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [historyType, setHistoryType] = useState<'both' | 'points' | 'stamps'>('both');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: user, isLoading: isUserLoading } = useAdminParticipantDetails(id);
  const { data: historyData, isLoading: isHistoryLoading } = useAdminParticipantHistory(id, page, limit, historyType);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // If loading user, show a full screen loader or similar
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
      )
  }

  const transactions = historyData?.data || [];
  const totalPages = historyData ? Math.ceil(historyData.total / limit) : 0;

  // Map Admin User data to Customer Profile format for the Header
  const profile: ParticipantProfileResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    // Add missing fields with defaults or correct mapping
    role: 'consumer',
    uniqueCode: 'N/A',
    globalTotalPoints: user.globalTotalPoints,
    matchingPoints: user.matchingPoints,
    pointUtilization: 0, // Not available in AdminParticipant
    totalPointsEarned: 0, // Not available
    totalPointsRedeemed: user.rewardsRedeemed, // Approximation or 0
    isDisabled: false,
    createdAt: user.joinedDate,
    updatedAt: new Date().toISOString(),
    campaignBalances: [] // Not fetched
  };

  const balanceData: ParticipantGlobalBalanceResponse = {
    globalTotalPoints: user.globalTotalPoints,
    matchingPoints: user.matchingPoints,
    campaignBalances: [] // Not fetched
  };

  const totalPoints = user.globalTotalPoints || 0;
  const matchingPoints = user.matchingPoints || 0;
  const utilization = 0;
  const badgeLevel = user.badgeLevel || 'Member';

  return (
    // We recreate the Customer Layout structure here
    // Note: This sits INSIDE the Admin Layout's main content area if we don't opt-out.
    // However, to make it "exactly" like the wallet page, we render the Sidebar and Header.
    // If this page is rendered inside the Admin Layout, we will have double sidebars.
    // Ideally, we would want to hide the Admin Sidebar.
    // Since we can't easily opt-out of the parent layout in Next.js App Router without route groups,
    // We will render this as an "Impersonation View" that might look a bit nested,
    // OR we rely on the fact that the user might have set up route groups.
    // Given the task, I will render the full layout. If it looks double-nested, it's the trade-off.

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
      <CustomerSidebar isOpen={isSidebarOpen} activePath="/wallet" />

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
            {/* Back Button for Admin Context */}
            <div className="mb-6 flex items-center justify-between">
                 <Button variant="outline" onClick={() => router.back()} className="hover:bg-gray-200">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Exit User View
                 </Button>
                 <div className="text-sm text-gray-500 italic">
                    Viewing as {user.name}
                 </div>
            </div>

            {/* Wallet Page Content */}
             <div className="container mx-auto">
                <div className="text-center mb-12">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">My Wallet</h1>
                  <p className="mt-4 text-lg text-gray-600">Your points balance and transaction history.</p>
                </div>

                <div className="space-y-8">
                  <PointsBalanceDisplay
                    totalPoints={totalPoints}
                    matchingPoints={matchingPoints}
                    totalStamps={0}
                    utilization={utilization}
                    badgeLevel={badgeLevel}
                    isLoading={isUserLoading}
                  />

                  <TransactionHistoryTable
                    transactions={transactions}
                    isLoading={isHistoryLoading}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    historyType={historyType}
                    onHistoryTypeChange={setHistoryType}
                  />

                  {/* Join Campaign Button (Visual only or disabled for Admin) */}
                  <div className="flex justify-center mt-8">
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 opacity-50 cursor-not-allowed">
                        Join Campaign (Disabled for Admin)
                      </Button>
                  </div>
                </div>
             </div>
          </main>
      </div>
      </div>
    </div>
  );
}
