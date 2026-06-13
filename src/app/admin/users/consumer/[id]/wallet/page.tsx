'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminParticipantDetails, useAdminParticipantHistory } from '@/services/admin/hook';
import { PointsBalanceDisplay } from '@/components/customer/PointsBalanceDisplay';
import { TransactionHistoryTable } from '@/components/customer/TransactionHistoryTable';
import { Button } from '@/components/ui/button';

export default function ConsumerWalletPage() {
  const params = useParams();
  const id = params?.id as string;
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [historyType, setHistoryType] = useState<'both' | 'points' | 'stamps'>('both');

  const { data: user, isLoading: isUserLoading } = useAdminParticipantDetails(id);
  const { data: historyData, isLoading: isHistoryLoading } = useAdminParticipantHistory(id, page, limit, historyType);

  if (isUserLoading) return null;
  if (!user) return null;

  const transactions = historyData?.data || [];
  const totalPages = historyData ? Math.ceil(historyData.total / limit) : 0;

  const totalPoints = user.globalTotalPoints || 0;
  const matchingPoints = user.matchingPoints || 0;
  const utilization = 0;
  const badgeLevel = user.badgeLevel || 'Member';

  return (
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

        <div className="flex justify-center mt-8">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 opacity-50 cursor-not-allowed">
              Join Campaign (Disabled for Admin)
            </Button>
        </div>
      </div>
    </div>
  );
}
