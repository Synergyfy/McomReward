'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MatchingPointsOverview from '@/components/dashboard/matching-points/MatchingPointsOverview';
import MatchingPointsHistoryTable from '@/components/dashboard/matching-points/MatchingPointsHistoryTable';
import { matchingPointsOverview, matchingPointsHistory } from '@/lib/mock-data/matchingPoints';

export default function MatchingPointsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Matching Points</h1>

      {/* Overview, Earning, and Redemption Rules */}
      <MatchingPointsOverview overview={matchingPointsOverview} />

      {/* Admin Notices or Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Notices & Restrictions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {matchingPointsOverview.adminNotices.map((notice, index) => (
              <li key={index}>{notice}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Matching Points Activity Log */}
      <MatchingPointsHistoryTable history={matchingPointsHistory} />
    </div>
  );
}
