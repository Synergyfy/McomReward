'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Ticket, ShoppingBag } from "lucide-react";
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { RedemptionSuccessDialog } from '@/components/customer/RedemptionSuccessDialog';

import { useGetPublicCampaignDetails, useGetParticipantBalance, useRedeemReward } from '@/services/customer-campaigns/hook';
import { useCampaignMembership } from '@/context/CampaignMembershipContext';

export default function RedeemPointsPage() {
  const { campaignId } = useCampaignMembership();
  const { data: campaign } = useGetPublicCampaignDetails(campaignId);
  const { data: balance } = useGetParticipantBalance(campaignId);
  const { mutate: redeemReward } = useRedeemReward();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<any>(null);

  const rewards = campaign?.rewards || [];
  const userPoints = balance?.points || 0;

  const handleRedeemClick = (rewardId: string) => {
    const reward = rewards.find((r: any) => r.id === rewardId);
    if (!reward) return;

    redeemReward({
      staffId: 'mock-staff-id', // Mocked as per instructions/context limitations
      participantId: 'mock-participant-id', // Mocked
      rewardId: rewardId,
      redemptionCode: `RED-${Date.now()}` // Generated
    }, {
      onSuccess: () => {
        setSelectedReward(reward);
        setIsDialogOpen(true);
      },
      onError: (error) => {
        console.error(error);
        alert('Failed to redeem reward. Please try again.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">Redeem Your Points</h1>
          <p className="mt-2 text-lg text-gray-600">Current Points: <span className="font-bold text-orange-600">{userPoints}</span></p>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {rewards.map((reward: any) => {
            const canRedeem = userPoints >= reward.pointsRequired;
            return (
              <Card key={reward.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="relative h-48 w-full">
                  <Image
                    src={reward.image}
                    alt={reward.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-800">{reward.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <div>
                    <CardDescription className="text-lg text-gray-700 mb-4 h-20">
                      {reward.description}
                    </CardDescription>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-orange-600">{reward.pointsRequired} pts</span>
                      <Gift className="h-8 w-8 text-gray-400" />
                    </div>
                    <Progress value={Math.min((userPoints / reward.pointsRequired) * 100, 100)} className="mb-4 h-2 bg-orange-100 [&>div]:bg-orange-500" />
                  </div>
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100"
                    disabled={!canRedeem}
                    onClick={() => handleRedeemClick(reward.id)}
                  >
                    {canRedeem ? 'Redeem' : `Requires ${reward.pointsRequired} points`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <RedemptionSuccessDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        rewardTitle={selectedReward.title}
      />
    </div>
  );
}
