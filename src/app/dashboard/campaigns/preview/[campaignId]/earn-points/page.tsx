
'use client';

import React from 'react';
import EarnPointsPagePreview from '@/components/dashboard/campaigns/previews/EarnPointsPagePreview';
import { CampaignResponse } from '@/services/campaigns/types';

const mockCampaignData: CampaignResponse = {
  id: 'mock-campaign-id',
  name: 'Mock Earn Points Campaign',
  campaignType: 'mock_type',
  campaignMessage: 'This is a mock campaign message for earning points.',
  startDate: '2023-01-01T00:00:00Z',
  endDate: '2023-12-31T23:59:59Z',
  quantity: 100,
  audienceType: 'all',
  bannerUrl: 'http://example.com/banner.jpg',
  logoUrl: 'http://example.com/logo.png',
  ctaText: 'Start Earning',
  ctaBackgroundColor: '#000000',
  ctaTextColor: '#FFFFFF',
  textColor: '#000000',
  backgroundColor: '#FFFFFF',
  signUpPoint: 10,
  rewardType: 'points',
  regularPointsThreshold: 50,
  matchingPointsThreshold: 20,
  earnPointPageTitle: 'How to Earn Points in this Campaign',
  earnPointPageDescription: 'Here are various ways you can collect points.',
  redeemRewardPageTitle: 'Redeem Your Hard-Earned Rewards',
  redeemRewardPageDescription: 'Browse and claim exciting rewards.',
  contactUsPageTitle: 'Need Help?',
  contactUsPageDescription: 'Our support team is ready to assist you.',
  contactEmail: 'earnsupport@example.com',
  contactPhoneNumber: '+1-555-987-6543',
  footerText: '© 2023 Earn Points Program',
  rewards: [],
  uniqueCode: null,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  deletedAt: null,
  disabled: false,
  totalPointsEarned: 0,
  totalPointsRedeemed: 0,
  totalMatchingPointsEarned: 0,
  matchingPointsDisabledByAdmin: false,
};

export default function EarnPointsPreviewPage() {
  return (
    <EarnPointsPagePreview campaign={mockCampaignData} />
  );
}
