'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MatchingPointsOverview from '@/components/dashboard/matching-points/MatchingPointsOverview';
import MatchingPointsHistoryTable from '@/components/dashboard/matching-points/MatchingPointsHistoryTable';
import { matchingPointsOverview as mockOverview } from '@/lib/mock-data/matchingPoints';
import { useGetMatchingPointBalance, useGetMatchingPointsHistory } from '@/services/matching-points/hook';
import { Loader2 } from 'lucide-react';

export default function MatchingPointsPage() {
  const { data: balanceData, isLoading: isBalanceLoading } = useGetMatchingPointBalance();
  const { data: historyData, isLoading: isHistoryLoading } = useGetMatchingPointsHistory({ page: 1, limit: 10 });

  // Merge mock overview with real balance
  const overview = {
    ...mockOverview,
    totalMatchingPoints: balanceData?.matching_points ?? 0,
  };

  if (isBalanceLoading || isHistoryLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Matching Points</h1>

      {/* Overview, Earning, and Redemption Rules */}
      <MatchingPointsOverview overview={overview} />

      {/* Admin Notices or Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Notices & Restrictions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {mockOverview.adminNotices.map((notice, index) => (
              <li key={index}>{notice}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Matching Points Activity Log */}
      <MatchingPointsHistoryTable history={historyData?.data || []} />
    </div>
  );
}

