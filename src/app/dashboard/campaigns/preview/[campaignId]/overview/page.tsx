
'use client';

import React from 'react';
import CampaignPreview from '@/components/dashboard/campaigns/previews/CampaignPreview';
import { mockClaimableCampaigns } from '@/app/mock-data';
import { useParams } from 'next/navigation';

export default function CampaignPreviewPage() {
  const params = useParams();
  const { campaignId } = params;

  const campaign = mockClaimableCampaigns.find(c => c.id === campaignId);

  if (!campaign) {
    return <div className="p-8">Campaign not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CampaignPreview campaign={campaign} />
    </div>
  );
}
