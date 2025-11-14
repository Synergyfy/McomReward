
'use client';

import React from 'react';
import RedeemPointsPagePreview from '@/components/dashboard/campaigns/previews/RedeemPointsPagePreview';
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
    earnTitle: '',
    earnText: '',
    redeemTitle: 'Redeem Your Points',
    redeemText: 'Use your points to claim exclusive rewards and discounts.',
    contactTitle: '',
    contactText: '',
    contactEmail: '',
    contactPhone: '',
    footerText: '',
    howToEarn: [],
    termsAndConditions: [],
};

export default function RedeemPointsPreviewPage() {
  return (
    <RedeemPointsPagePreview campaignData={mockCampaignData} />
  );
}
