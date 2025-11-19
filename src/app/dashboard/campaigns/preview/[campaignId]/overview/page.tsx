
'use client';

import React, { useMemo } from 'react';
import CampaignPreview from '@/components/dashboard/campaigns/previews/CampaignPreview';
import { useParams } from 'next/navigation';
import { useGetClaimableCampaigns } from '@/services/campaigns/hook';

export default function CampaignPreviewPage() {
  const params = useParams();
  const { campaignId } = params;

  // Fetch claimable campaigns to find the current one. 
  // Ideally there should be a getSingleCampaign endpoint.
  const { data: claimableCampaignsData, isLoading } = useGetClaimableCampaigns(1, 100);

  const campaign = useMemo(() => {
    return claimableCampaignsData?.data.find(c => c.id === campaignId);
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
