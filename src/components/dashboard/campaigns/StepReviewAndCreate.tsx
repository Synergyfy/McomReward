'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaignForm } from '@/context/CampaignFormContext';
import Image from 'next/image';

interface StepProps {
  onBack: () => void;
}

// Mock rewards data (should be fetched from API)
const mockRewards = [
  { id: '1', title: 'Summer Voucher ($50)', image: 'https://via.placeholder.com/150' },
  { id: '2', title: 'Gift Card ($100)', image: 'https://via.placeholder.com/150' },
  { id: '3', title: 'Discount Coupon (20% off)', image: 'https://via.placeholder.com/150' },
];

const ctaButtonLabels = {
  'Claim Reward': 'Claim Reward',
  'Join Now': 'Join Now',
  'Refer & Earn': 'Refer & Earn',
};

export default function StepReviewAndCreate({ onBack }: StepProps) {
  const { formData, resetFormData } = useCampaignForm();

  const handleCreateCampaign = () => {
    // Here you would typically send the formData to your API
    console.log('Creating campaign with data:', formData);
    alert('Campaign Created Successfully!');
    resetFormData(); // Clear form after submission
    // Optionally navigate to campaign list or detail page
  };

  const selectedReward = mockRewards.find(r => r.id === formData.rewardId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 5: Review and Create Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <h4 className="text-lg font-semibold mb-3">Campaign Details</h4>
        <div className="grid gap-2 mb-6 text-sm">
          <p><strong>Campaign Type:</strong> {formData.campaignType}</p>
          <p><strong>Campaign Name:</strong> {formData.campaignName}</p>
          <p><strong>Reward:</strong> {selectedReward?.title || 'N/A'}</p>
          <p><strong>Start Date:</strong> {formData.startDate?.toLocaleString() || 'N/A'}</p>
          <p><strong>End Date:</strong> {formData.endDate?.toLocaleString() || 'N/A'}</p>
          <p><strong>Rewards Available:</strong> {formData.rewardsAvailable}</p>
          <p><strong>Audience Type:</strong> {formData.audienceType} {formData.audienceType === 'badge_level' && `(${formData.badgeLevel})`}</p>
          <p><strong>Message:</strong> {formData.campaignMessage}</p>
          <p><strong>CTA Button:</strong> {ctaButtonLabels[formData.ctaButtonText]}</p>
          {formData.imageUrl && (
            <div>
              <strong>Image/Banner:</strong>
              <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-200 mt-2">
                <Image src={formData.imageUrl} alt="Campaign Banner" layout="fill" objectFit="cover" />
              </div>
            </div>
          )}
        </div>

        <h4 className="text-lg font-semibold mb-3">Distribution Channels</h4>
        <div className="grid gap-2 mb-6 text-sm">
          <p><strong>QR Code:</strong> {formData.distributionChannels.qrCode ? 'Enabled' : 'Disabled'}</p>
          <p><strong>Share Link:</strong> {formData.distributionChannels.shareLink ? 'Enabled' : 'Disabled'}</p>
          <p><strong>Embed Button:</strong> {formData.distributionChannels.embedButton ? 'Enabled' : 'Disabled'}</p>
          <p><strong>Email Send:</strong> {formData.distributionChannels.emailSend ? 'Enabled' : 'Disabled'}</p>
        </div>

        <h4 className="text-lg font-semibold mb-3">Scheduling & Auto Rules</h4>
        <div className="grid gap-2 mb-6 text-sm">
          <p><strong>Stop after claims:</strong> {formData.schedulingRules.stopAfterClaims > 0 ? formData.schedulingRules.stopAfterClaims : 'Unlimited'}</p>
          <p><strong>Pause on reward empty:</strong> {formData.schedulingRules.pauseOnRewardEmpty ? 'Yes' : 'No'}</p>
          <p><strong>Auto-switch to points:</strong> {formData.schedulingRules.autoSwitchToPoints ? 'Yes' : 'No'}</p>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={handleCreateCampaign}>Create Campaign</Button>
        </div>
      </CardContent>
    </Card>
  );
}
