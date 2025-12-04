'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetCampaignById } from '@/services/campaigns/hook';
import LoadingSpinner from '@/components/ui/Loading';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { CampaignResponse, BusinessCampaign } from '@/services/campaigns/types';

// Type guard to determine if the campaign is a BusinessCampaign
const isBusinessCampaign = (campaign: CampaignResponse | BusinessCampaign): campaign is BusinessCampaign => {
  return (campaign as BusinessCampaign).campaign_type !== undefined;
};

export default function EarnPointsPage() {
  const params = useParams();
  const { campaignId } = params;

  const { data: campaignData, isLoading, isError } = useGetCampaignById(campaignId as string);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const campaign = campaignData as (CampaignResponse | BusinessCampaign);

  if (isError || !campaign) {
    return <p className="text-center text-lg text-red-500 py-20">Campaign not found.</p>;
  }

  const earnPointPageTitle = isBusinessCampaign(campaign) ? campaign.earn_point_page_title : campaign.earnPointPageTitle;
  const earnPointPageDescription = isBusinessCampaign(campaign) ? campaign.earn_point_page_description : campaign.earnPointPageDescription;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg border-none overflow-hidden">
          <CardHeader className="bg-yellow-50 border-b border-yellow-100 p-8 text-center">
            <div className="mx-auto bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              {earnPointPageTitle || 'Earn Points'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div
              className="prose prose-lg max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: earnPointPageDescription || '<p>No description available.</p>' }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
