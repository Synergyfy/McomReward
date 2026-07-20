
'use client';

import React, { useMemo } from 'react';
import ContactUsPagePreview from '@/components/dashboard/campaigns/previews/ContactUsPagePreview';
import { useParams } from 'next/navigation';
import { useGetClaimableCampaigns } from '@/services/campaigns/hook';
import { CampaignResponse } from '@/services/campaigns/types';

export default function ContactUsPreviewPage() {
  const params = useParams();
  const { campaignId } = params;

  const { data: claimableCampaignsData, isLoading } = useGetClaimableCampaigns(1, 100);

  const campaign = useMemo(() => {
    const c = claimableCampaignsData?.data.find(c => c.id === campaignId);
    if (!c) return null;

    return {
      id: c.id,
      name: c.name,
      campaignType: c.campaign_type,
      campaignMessage: c.campaign_message,
      startDate: c.start_date,
      endDate: c.end_date,
      quantity: c.quantity,
      audienceType: c.audience_type,
      bannerUrl: c.banner_url,
      logoUrl: c.logo_url || '',
      ctaText: c.cta_text,
      ctaBackgroundColor: c.cta_background_color,
      ctaTextColor: c.cta_text_color,
      textColor: c.text_color,
      backgroundColor: c.background_color,
      rewards: c.rewards || [],
      uniqueCode: c.uniqueCode || null,
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
      disabled: c.disabled,
      totalPointsEarned: 0,
      totalPointsRedeemed: 0,
      totalMatchingPointsEarned: 0,
      matchingPointsDisabledByAdmin: false,
    } as CampaignResponse;
  }, [claimableCampaignsData, campaignId]);

  if (isLoading) {
    return <div className="p-4 md:p-8 text-center">Loading campaign details...</div>;
  }

  if (!campaign) {
    return (
      <div className="p-4 md:p-8 text-center">
        <p className="text-lg text-red-600 mb-2">Campaign not found.</p>
      </div>
    );
  }

  return <ContactUsPagePreview campaign={campaign} />;
}
