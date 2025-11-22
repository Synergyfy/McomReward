'use client';

import React, { useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { RedemptionSuccessDialog } from '@/components/customer/RedemptionSuccessDialog';
import { useGetPublicCampaignDetails } from '@/services/customer-campaigns/hook';
import { RewardResponse } from '@/services/rewards/types';
import { useCampaignMembership } from '@/context/CampaignMembershipContext';

interface PageProps {
    params: Promise<{ campaignId: string }>;
}

export default function RedeemPointsPage({ params }: PageProps) {
    const { campaignId } = use(params);
    console.log('RedeemPointsPage campaignId:', campaignId);
    const { data: campaign, isLoading, error } = useGetPublicCampaignDetails(campaignId);
    console.log('RedeemPointsPage data:', campaign, 'isLoading:', isLoading, 'error:', error);
    const { isMember } = useCampaignMembership(); // Assuming membership context might have points, but for now using mock or campaign data if available

    // TODO: Fetch real user points from an API. For now, mocking or using a placeholder.
    // The campaign object has totalPointsEarned, but that might be aggregate. 
    // We'll assume a mock value for now as per previous implementation, or 0 if not member.
    const [userPoints, setUserPoints] = useState(isMember ? 200 : 0);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedReward, setSelectedReward] = useState<{ title: string } | null>(null);

    const handleRedeemClick = (reward: RewardResponse) => {
        // In a real app, this would call a mutation to redeem the reward
        if (userPoints >= reward.pointsRequired) {
            setSelectedReward(reward);
            setUserPoints(prev => prev - reward.pointsRequired);
            setIsDialogOpen(true);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (error || !campaign) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load rewards.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-800">
                        {campaign.redeemRewardPageTitle || 'Redeem Your Points'}
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        {campaign.redeemRewardPageDescription || `Current Points: `}
                        <span className="font-bold text-orange-600">{userPoints}</span>
                    </p>
                </div>

                {/* Rewards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {campaign.rewards && campaign.rewards.length > 0 ? (
                        campaign.rewards.map((reward) => {
                            const canRedeem = userPoints >= reward.pointsRequired;
                            // Calculate progress (clamped to 100)
                            const progress = Math.min((userPoints / reward.pointsRequired) * 100, 100);

                            return (
                                <Card key={reward.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                                    <div className="relative h-48 w-full">
                                        <Image
                                            src={reward.image || '/placeholder-image.jpg'}
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
                                            <CardDescription className="text-lg text-gray-700 mb-4 h-20 line-clamp-3">
                                                {reward.description}
                                            </CardDescription>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xl font-bold text-orange-600">{reward.pointsRequired} pts</span>
                                                <Trophy className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <Progress value={progress} className="mb-4 h-2 bg-orange-100 [&>div]:bg-orange-500" />
                                        </div>
                                        <Button
                                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            disabled={!canRedeem}
                                            onClick={() => handleRedeemClick(reward)}
                                        >
                                            {canRedeem ? 'Redeem' : `Requires ${reward.pointsRequired} points`}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center text-gray-500">No rewards available for redemption at this time.</div>
                    )}
                </div>
            </div>
            {selectedReward && (
                <RedemptionSuccessDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    rewardTitle={selectedReward.title}
                />
            )}
        </div>
    );
}
