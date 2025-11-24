
'use client';

import React, { useMemo } from 'react';
import CampaignPreview from '@/components/dashboard/campaigns/previews/CampaignPreview';
import { useParams } from 'next/navigation';
import { useGetClaimableCampaigns } from '@/services/campaigns/hook';
import { PublicCampaignResponse } from '@/services/campaigns/types';

export default function CampaignPreviewPage() {
  const params = useParams();
  const { campaignId } = params;

  // Fetch claimable campaigns to find the current one. 
  // Ideally there should be a getSingleCampaign endpoint.
  const { data: claimableCampaignsData, isLoading } = useGetClaimableCampaigns(1, 100);

  const campaign = useMemo(() => {
    const campaignData = claimableCampaignsData?.data.find(c => c.id === campaignId);
    if (!campaignData) {
      return null;
    }
    // Directly return campaignData as it already conforms to PublicCampaignResponse
    return campaignData as PublicCampaignResponse;
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
