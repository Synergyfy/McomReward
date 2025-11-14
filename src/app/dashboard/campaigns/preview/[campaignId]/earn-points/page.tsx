
'use client';

import React from 'react';
import EarnPointsPagePreview from '@/components/dashboard/campaigns/previews/EarnPointsPagePreview';
import { CampaignFormData } from '@/context/CampaignFormContext';

const mockCampaignData: CampaignFormData = {
    campaignType: '',
    campaignName: '',
    rewardIds: [],
    startDate: undefined,
    endDate: undefined,
    rewardsAvailable: 0,
    audienceType: [],
    campaignMessage: '',
    imageUrl: '',
    logoUrl: '',
    ctaButtonText: 'Claim Reward',
    distributionChannels: {
        qrCode: false,
        shareLink: false,
        embedButton: false,
        emailSend: false,
    },
    schedulingRules: {
        startDate: undefined,
        stopAfterClaims: 0,
        pauseOnRewardEmpty: false,
        autoSwitchToPoints: true,
    },
    bgColor: '#FFFFFF',
    ctaBgColor: '#000000',
    bgColorTextColor: '#000000',
    ctaTextColor: '#FFFFFF',
    earnTitle: 'How to Earn Points',
    earnText: 'Here are the ways you can earn points in this campaign.',
    redeemTitle: '',
    redeemText: '',
    contactTitle: '',
    contactText: '',
    contactEmail: '',
    contactPhone: '',
    footerText: '',
    howToEarn: [],
    termsAndConditions: [],
};

export default function EarnPointsPreviewPage() {
  return (
    <EarnPointsPagePreview campaignData={mockCampaignData} />
  );
}
