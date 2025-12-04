'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetCampaignById } from '@/services/campaigns/hook';
import LoadingSpinner from '@/components/ui/Loading';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";
import { CampaignResponse, BusinessCampaign } from '@/services/campaigns/types';

// Type guard to determine if the campaign is a BusinessCampaign
const isBusinessCampaign = (campaign: CampaignResponse | BusinessCampaign): campaign is BusinessCampaign => {
  return (campaign as BusinessCampaign).campaign_type !== undefined; // BusinessCampaign uses snake_case
};

export default function CustomerRedeemPointsPage() {
    const params = useParams();
    const { campaignId } = params;
    const { data: campaignData, isLoading, isError } = useGetCampaignById(campaignId as string);

    if (isLoading) return <LoadingSpinner />;
    
    const campaign = campaignData as (CampaignResponse | BusinessCampaign);

    if (isError || !campaign) return <p className="text-center text-red-500 py-10">Campaign not found.</p>;

    const redeemRewardPageTitle = isBusinessCampaign(campaign) ? campaign.redeem_reward_page_title : campaign.redeemRewardPageTitle;
    const redeemRewardPageDescription = isBusinessCampaign(campaign) ? campaign.redeem_reward_page_description : campaign.redeemRewardPageDescription;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card className="border-none shadow-lg">
                <CardHeader className="bg-pink-50 border-b border-pink-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-100 rounded-full">
                            <Gift className="w-6 h-6 text-pink-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-800">
                            {redeemRewardPageTitle || 'Redeem Rewards'}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div
                        className="prose prose-lg max-w-none text-gray-600"
                        dangerouslySetInnerHTML={{ __html: redeemRewardPageDescription || '<p>No description available.</p>' }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
