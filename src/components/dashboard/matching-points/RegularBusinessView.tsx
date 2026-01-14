'use client';

import React, { useState } from 'react';
import { useGetMatchingPointBalance, useGetMatchingPointsHistory, useGetPublicMatchingRewards } from '@/services/matching-points/hook';
import MatchingPointsOverview from '@/components/dashboard/matching-points/MatchingPointsOverview';
import MatchingPointsHistoryTable from '@/components/dashboard/matching-points/MatchingPointsHistoryTable';
import { matchingPointsOverview as mockOverview } from '@/lib/mock-data/matchingPoints';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Gift } from 'lucide-react';
import { MatchingPointReward } from '@/services/matching-points/types';
import { mockMyRedemptions } from '@/lib/mock-data/matchingPointsRewards'; // Still using mock redemptions for "My Redemptions" history as specific endpoint wasn't provided, but main rewards come from API
import MatchingRewardCard from './MatchingRewardCard';
import RewardDetailsModal from './RewardDetailsModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RegularBusinessView() {
  const { data: balanceData, isLoading: isBalanceLoading } = useGetMatchingPointBalance();
  const { data: historyData, isLoading: isHistoryLoading } = useGetMatchingPointsHistory({ page: 1, limit: 10 });
  const { data: rewardsData, isLoading: isRewardsLoading } = useGetPublicMatchingRewards({
      page: 1,
      limit: 10,
      userType: 'BUSINESS' // Filter for business-eligible rewards
  });

  const [selectedReward, setSelectedReward] = useState<MatchingPointReward | null>(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

  if (isBalanceLoading || isHistoryLoading || isRewardsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const currentBalance = balanceData?.matching_points ?? 0;

  const overview = {
    ...mockOverview,
    totalMatchingPoints: currentBalance,
  };

  const handleRewardClick = (reward: MatchingPointReward) => {
    setSelectedReward(reward);
    setIsRewardModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Matching Points</h1>

      {/* Overview, Earning, and Redemption Rules */}
      <MatchingPointsOverview overview={overview} />

      {/* Rewards Catalog */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">Redeem Your Points</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewardsData?.data.map((reward) => (
                <MatchingRewardCard
                    key={reward.id}
                    reward={reward}
                    currentBalance={currentBalance}
                    onClick={() => handleRewardClick(reward)}
                />
            ))}
             {rewardsData?.data.length === 0 && (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No rewards available at the moment.</p>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admin Notices or Restrictions */}
        <Card className="md:col-span-1 h-fit">
            <CardHeader>
            <CardTitle>Admin Notices</CardTitle>
            </CardHeader>
            <CardContent>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {mockOverview.adminNotices.map((notice, index) => (
                <li key={index}>{notice}</li>
                ))}
            </ul>
            </CardContent>
        </Card>

        {/* History Tabs */}
        <div className="md:col-span-2">
            <Tabs defaultValue="activity">
                <TabsList className="w-full">
                    <TabsTrigger value="activity" className="flex-1">Point Activity</TabsTrigger>
                    <TabsTrigger value="redemptions" className="flex-1">My Redemptions</TabsTrigger>
                </TabsList>
                <TabsContent value="activity" className="mt-4">
                    <MatchingPointsHistoryTable history={historyData?.data || []} />
                </TabsContent>
                <TabsContent value="redemptions" className="mt-4">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Reward</TableHead>
                                    <TableHead>Points</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockMyRedemptions.map((redemption) => (
                                    <TableRow key={redemption.id}>
                                        <TableCell>{format(new Date(redemption.redeemedAt), 'MMM d, yyyy')}</TableCell>
                                        <TableCell className="font-medium">{redemption.rewardTitle}</TableCell>
                                        <TableCell>{redemption.pointsRedeemed}</TableCell>
                                        <TableCell>
                                            <Badge variant={redemption.status === 'completed' ? 'default' : 'secondary'}>
                                                {redemption.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {mockMyRedemptions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                            No redemptions yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>

      <RewardDetailsModal
          isOpen={isRewardModalOpen}
          onClose={() => setIsRewardModalOpen(false)}
          reward={selectedReward}
          currentBalance={currentBalance}
      />
    </div>
  );
}
