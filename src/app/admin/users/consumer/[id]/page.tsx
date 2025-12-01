'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminParticipantDetails, useAdminParticipantHistory } from '@/services/admin/hook';
import { PointsBalanceDisplay } from '@/components/customer/PointsBalanceDisplay';
import { TransactionHistoryTable } from '@/components/customer/TransactionHistoryTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function ConsumerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: user, isLoading: isUserLoading } = useAdminParticipantDetails(id);
  const { data: historyData, isLoading: isHistoryLoading } = useAdminParticipantHistory(id, page, limit);

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
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

  // Utilize user details for display
  // Assuming user object has similar structure to what PointsBalanceDisplay expects or map it
  const totalPoints = user.globalTotalPoints || 0;
  const matchingPoints = user.matchingPoints || 0;
  // Admin might not have access to 'utilization' directly unless added to AdminParticipant type
  // For now defaulting to 0 or calculating if possible.
  const utilization = 0;
  const badgeLevel = user.badgeLevel || 'Member';

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="hover:bg-gray-200">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Consumers
            </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
             {user.name}'s Wallet
          </h1>
          <p className="mt-2 text-lg text-gray-600">User ID: {user.id}</p>
        </div>

        <div className="space-y-8">
          <PointsBalanceDisplay
             totalPoints={totalPoints}
             matchingPoints={matchingPoints}
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
          />
        </div>
      </div>
    </div>
  );
}
