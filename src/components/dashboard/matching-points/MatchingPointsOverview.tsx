import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PoundSterling, TrendingUp, Info } from 'lucide-react';

export interface MatchingPointsOverviewData {
  totalMatchingPoints: number;
  totalRegularPoints: number;
  earningRules: string[];
  redemptionRules: string[];
  adminNotices?: string[]; // Optional as it might be used separately
}

interface MatchingPointsOverviewProps {
  overview: MatchingPointsOverviewData;
}

export default function MatchingPointsOverview({ overview }: MatchingPointsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Points Overview */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Points Balance</CardTitle>
          <PoundSterling className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.totalMatchingPoints} Matching Points</div>

        </CardContent>
      </Card>

      {/* How Matching Points are Earned */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">How They&apos;re Earned</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {overview.earningRules.map((rule: string, index: number) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Redemption Rules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Redemption Rules</CardTitle>
          <Info className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {overview.redemptionRules.map((rule: string, index: number) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
