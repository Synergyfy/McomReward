
'use client';

import React from 'react';
import ContactUsPagePreview from '@/components/dashboard/campaigns/previews/ContactUsPagePreview';
import { CampaignResponse } from '@/services/campaigns/types';

const mockCampaignData: CampaignResponse = {
  id: 'mock-campaign-id',
  name: 'Mock Campaign Name',
  campaignType: 'mock_type',
  campaignMessage: 'This is a mock campaign message.',
  startDate: '2023-01-01T00:00:00Z',
  endDate: '2023-12-31T23:59:59Z',
  quantity: 100,
  audienceType: 'all',
  bannerUrl: 'http://example.com/banner.jpg',
  logoUrl: 'http://example.com/logo.png',
  ctaText: 'Learn More',
  ctaBackgroundColor: '#000000',
  ctaTextColor: '#FFFFFF',
  textColor: '#000000',
  backgroundColor: '#FFFFFF',
  signUpPoint: 10,
  rewardType: 'points',
  regularPointsThreshold: 50,
  matchingPointsThreshold: 20,
  earnPointPageTitle: 'Earn Points Easily',
  earnPointPageDescription: 'Participate and get rewards!',
  redeemRewardPageTitle: 'Redeem Your Rewards',
  redeemRewardPageDescription: 'Choose from a variety of exciting rewards.',
  contactUsPageTitle: 'Contact Our Support',
  contactUsPageDescription: 'We are here to assist you with any queries.',
  contactEmail: 'support@example.com',
  contactPhoneNumber: '+1-555-123-4567',
  footerText: '© 2023 Mock Loyalty Program',
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

export default function ContactUsPreviewPage() {
  return (
    <ContactUsPagePreview campaign={mockCampaignData} />
  );
}
