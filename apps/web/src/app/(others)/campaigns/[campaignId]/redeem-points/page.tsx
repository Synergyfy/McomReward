'use client';

import React, { useState, use } from 'react';
import DOMPurify from 'dompurify';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import Image from 'next/image';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { RedemptionSuccessDialog } from '@/components/customer/RedemptionSuccessDialog';
import { useGetPublicCampaignDetails, useGetParticipantBalance, useRedeemRewardSelf } from '@/services/customer-campaigns/hook';
import { RewardResponse } from '@/services/rewards/types';
import { useCampaignMembership } from '@/context/CampaignMembershipContext';
import PublicRewardCard from '@/components/rewards/PublicRewardCard';

interface PageProps {
    params: Promise<{ campaignId: string }>;
}

export default function RedeemPointsPage({ params }: PageProps) {
    const { campaignId } = use(params);
    const router = useRouter();
    console.log('RedeemPointsPage campaignId:', campaignId);
    const { data: campaign, isLoading, error } = useGetPublicCampaignDetails(campaignId);
    const { data: balance } = useGetParticipantBalance(campaignId);
    const { mutate: redeemReward } = useRedeemRewardSelf();
    console.log('RedeemPointsPage data:', campaign, 'isLoading:', isLoading, 'error:', error);
    const { isMember } = useCampaignMembership();

    const userPoints = balance?.balance || 0;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedReward, setSelectedReward] = useState<{ title: string } | null>(null);

    const isAuthenticated = !!Cookies.get('access');

    const handleRedeemClick = (reward: RewardResponse) => {
        if (!isAuthenticated) {
            router.push(`/login?campaignId=${campaignId}&redirect=/campaigns/${campaignId}/redeem-points`);
            return;
        }
        if (userPoints >= reward.pointRequired) {
            redeemReward(
                {
                    rewardId: reward.id,
                    campaignId: campaignId,
                },
                {
                    onSuccess: () => {
                        setSelectedReward(reward);
                        setIsDialogOpen(true);
                    },
                    onError: (error) => {
                        console.error('Redemption failed:', error);
                        alert('Failed to redeem reward. Please try again.');
                    }
                }
            );
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
                    <div className="mt-2 text-lg text-gray-600">
                        {campaign.redeemRewardPageDescription ? (
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(campaign.redeemRewardPageDescription) }} />
                        ) : (
                            "Current Points: "
                        )}
                        <span className="font-bold text-orange-600">{userPoints}</span>
                    </div>
                </div>

                {/* Rewards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {campaign.businessRewards && campaign.businessRewards.length > 0 ? (
                        campaign.businessRewards.map((reward) => (
                            <PublicRewardCard
                                key={reward.id}
                                reward={reward}
                                userPoints={userPoints}
                                isMember={true} // Since they are on redeem page, they are members
                                onRedeem={() => handleRedeemClick(reward)}
                                className="h-full"
                            />
                        ))
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
