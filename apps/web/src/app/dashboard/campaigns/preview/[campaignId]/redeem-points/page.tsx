
'use client';

import React from 'react';
import RedeemPointsPagePreview from '@/components/dashboard/campaigns/previews/RedeemPointsPagePreview';
import { CampaignResponse } from '@/services/campaigns/types';

const mockCampaignData: CampaignResponse = {
  id: 'mock-redeem-campaign-id',
  name: 'Mock Redeem Points Campaign',
  campaignType: 'mock_redeem_type',
  campaignMessage: 'Redeem your points for amazing rewards!',
  startDate: '2023-01-01T00:00:00Z',
  endDate: '2023-12-31T23:59:59Z',
  quantity: 50,
  audienceType: 'members',
  bannerUrl: 'http://example.com/redeem-banner.jpg',
  logoUrl: 'http://example.com/redeem-logo.png',
  ctaText: 'Redeem Now',
  ctaBackgroundColor: '#FF0000',
  ctaTextColor: '#FFFFFF',
  textColor: '#000000',
  backgroundColor: '#F0F0F0',
  signUpPoint: 0,
  rewardType: 'discounts',
  regularPointsThreshold: 100,
  matchingPointsThreshold: 0,
  earnPointPageTitle: '',
  earnPointPageDescription: '',
  redeemRewardPageTitle: 'Exclusive Rewards for You!',
  redeemRewardPageDescription: 'Choose from a wide selection of rewards using your loyalty points.',
  contactUsPageTitle: 'Redemption Support',
  contactUsPageDescription: 'Contact us if you have issues with your redemption.',
  contactEmail: 'redeem@example.com',
  contactPhoneNumber: '+1-555-789-0123',
  footerText: '© 2023 Redeem Rewards Program',
  rewards: [
    {
      id: 'reward-1',
      title: '10% Off Voucher',
      points_required: 100,
      value: 10,
      description: 'Get 10% off your next purchase.',
      image: 'https://via.placeholder.com/400x300?text=10%25+Off',
      quantity: 50,
      disabled: false,
    },
    {
      id: 'reward-2',
      title: '$5 Gift Card',
      points_required: 200,
      value: 5,
      description: 'A $5 gift card to your favorite store.',
      image: 'https://via.placeholder.com/400x300?text=$5+Gift+Card',
      quantity: 25,
      disabled: false,
    },
  ],
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

export default function RedeemPointsPreviewPage() {
  return (
    <RedeemPointsPagePreview campaign={mockCampaignData} />
  );
}
