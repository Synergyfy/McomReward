
'use client';

import React, { useMemo } from 'react';
import CampaignPreview from '@/components/dashboard/campaigns/previews/CampaignPreview';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetClaimableCampaigns } from '@/services/campaigns/hook';
import { useGetBusinessRewards } from '@/services/business-reward/hooks';
import { CampaignResponse } from '@/services/campaigns/types';
import { BusinessReward } from '@/services/business-reward/types';

export default function CampaignPreviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { campaignId } = params;

  const { data: claimableCampaignsData, isLoading: isLoadingCampaigns } = useGetClaimableCampaigns(1, 100);
  const { data: businessRewardsData, isLoading: isLoadingRewards } = useGetBusinessRewards(1, 100);

  const businessRewardIds = useMemo(() => {
    const idsString = searchParams.get('business_reward_ids');
    if (idsString) {
      try {
        return JSON.parse(idsString) as string[];
      } catch (error) {
        console.error("Failed to parse business_reward_ids:", error);
        return [];
      }
    }
    return [];
  }, [searchParams]);

  const selectedRewards = useMemo(() => {
    if (!businessRewardsData || businessRewardIds.length === 0) {
      return [];
    }
    return businessRewardsData.data.filter((reward: BusinessReward) => businessRewardIds.includes(reward.id));
  }, [businessRewardsData, businessRewardIds]);

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
      rewards: selectedRewards.map(reward => ({
        id: reward.reward.id,
        title: reward.reward.title,
        points_required: reward.pointRequired,
        value: reward.reward.value || 0,
        description: reward.reward.description || '',
        image: reward.reward.image || '',
        quantity: reward.quantity ?? 0,
        disabled: reward.reward.disabled || false,
      })),
      uniqueCode: campaignData.uniqueCode || null,
      business_reward_ids: businessRewardIds,
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
  }, [claimableCampaignsData, campaignId, selectedRewards, businessRewardIds]);

  if (isLoadingCampaigns || isLoadingRewards) {
    return <div className="p-8 text-center">Loading campaign details...</div>;
  }

  if (!campaign) {
    return <div className="p-8 text-center">Campaign not found or not claimable.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CampaignPreview campaign={campaign} isClaimable={true} />
    </div>
  );
}
