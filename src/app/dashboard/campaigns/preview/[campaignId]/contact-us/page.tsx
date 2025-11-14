
'use client';

import React from 'react';
import ContactUsPagePreview from '@/components/dashboard/campaigns/previews/ContactUsPagePreview';
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
    redeemTitle: '',
    redeemText: '',
    contactTitle: 'Contact Us',
    contactText: 'We are here to help. Reach out to us with any questions.',
    contactEmail: 'support@example.com',
    contactPhone: '+1 (555) 123-4567',
    footerText: '',
    howToEarn: [],
    termsAndConditions: [],
};

export default function ContactUsPreviewPage() {
  return (
    <ContactUsPagePreview campaignData={mockCampaignData} />
  );
}
