
'use client';

import React, { useMemo } from 'react';
import CampaignPreview from '@/components/dashboard/campaigns/previews/CampaignPreview';
import { useParams } from 'next/navigation';
import { useGetClaimableCampaigns } from '@/services/campaigns/hook';
import { CampaignResponse, PublicCampaignResponse } from '@/services/campaigns/types'; // Keep PublicCampaignResponse for data fetching

export default function CampaignPreviewPage() {
  const params = useParams();
  const { campaignId } = params;

  const { data: claimableCampaignsData, isLoading } = useGetClaimableCampaigns(1, 100);

  const campaign = useMemo(() => {
    const campaignData = claimableCampaignsData?.data.find(c => c.id === campaignId);
    if (!campaignData) {
      return null;
    }

    // Transform PublicCampaignResponse to CampaignResponse
    const transformedCampaign: CampaignResponse = {
      id: campaignData.id,
      name: campaignData.name,
      campaignType: campaignData.campaign_type, // Map to CampaignResponse field
      campaignMessage: campaignData.campaign_message, // Map to CampaignResponse field
      startDate: campaignData.start_date, // Map to CampaignResponse field
      endDate: campaignData.end_date, // Map to CampaignResponse field
      quantity: campaignData.quantity,
      audienceType: campaignData.audience_type,
      bannerUrl: campaignData.banner_url,
      logoUrl: campaignData.logo_url || '',
      ctaText: campaignData.cta_text,
      ctaBackgroundColor: campaignData.cta_background_color,
      ctaTextColor: campaignData.cta_text_color,
      textColor: campaignData.text_color,
      backgroundColor: campaignData.background_color,
      rewards: campaignData.rewards.map(reward => ({
        id: reward.id,
        title: reward.title,
        points_required: reward.points_required,
        value: reward.value || 0, // Provide default if missing in PublicCampaignResponse
        description: reward.description || '', // Provide default if missing
        image: reward.image || '', // Provide default if missing
        quantity: reward.quantity || 0, // Provide default if missing
        disabled: reward.disabled || false, // Provide default if missing
      })),
      uniqueCode: campaignData.uniqueCode || null,
      // Provide default values for other CampaignResponse fields not present in PublicCampaignResponse
      signUpPoint: 0,
      rewardType: '',
      regularPointsThreshold: 0,
      matchingPointsThreshold: 0,
      earnPointPageTitle: '',
      earnPointPageDescription: '',
      redeemRewardPageTitle: '',
      redeemRewardPageDescription: '',
      contactUsPageTitle: '',
      contactUsPageDescription: '',
      contactEmail: '',
      contactPhoneNumber: '',
      footerText: '',
      createdAt: '',
      updatedAt: '',
      deletedAt: null,
      disabled: false,
      totalPointsEarned: 0,
      totalPointsRedeemed: 0,
      totalMatchingPointsEarned: 0,
      matchingPointsDisabledByAdmin: false,
    };
    return transformedCampaign;
  }, [claimableCampaignsData, campaignId]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading campaign details...</div>;
  }

  if (!campaign) {
    return <div className="p-8 text-center">Campaign not found or not claimable.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CampaignPreview campaign={campaign} />
    </div>
  );
}
