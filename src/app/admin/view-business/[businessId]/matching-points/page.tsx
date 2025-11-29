'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MatchingPointsOverview from '@/components/dashboard/matching-points/MatchingPointsOverview';
import MatchingPointsHistoryTable from '@/components/dashboard/matching-points/MatchingPointsHistoryTable';
// import { matchingPointsOverview, matchingPointsHistory } from '@/lib/mock-data/matchingPoints'; // No longer needed
import { useParams } from 'next/navigation'; // Import useParams
import { useGetMatchingPointsOverview, useGetMatchingPointsHistory } from '@/services/matching-points/hook'; // Import new hooks
import LoadingSpinner from '@/components/ui/Loading'; // Assuming this component exists or using default Loader2 icon

export default function MatchingPointsPage() {
  const params = useParams();
  const businessId = params.businessId as string;

  const { data: overviewData, isLoading: isLoadingOverview, isError: isErrorOverview } = useGetMatchingPointsOverview({ businessId });
  const { data: historyData, isLoading: isLoadingHistory, isError: isErrorHistory } = useGetMatchingPointsHistory({ businessId });

  if (isLoadingOverview || isLoadingHistory) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (isErrorOverview || isErrorHistory || !overviewData || !historyData) {
    return <div className="text-center text-red-500 py-10">Error loading matching points data.</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Matching Points</h1>

      {/* Overview, Earning, and Redemption Rules */}
      <MatchingPointsOverview overview={overviewData} />

      {/* Admin Notices or Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Notices & Restrictions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {overviewData.adminNotices.map((notice, index) => (
              <li key={index}>{notice}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Matching Points Activity Log */}
      <MatchingPointsHistoryTable history={historyData.history} />
    </div>
  );
}
