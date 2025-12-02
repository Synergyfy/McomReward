
'use client';

import React from 'react';
import CampaignPreview from '@/components/dashboard/campaigns/previews/CampaignPreview';
import { useParams } from 'next/navigation';
import { useGetCampaignById } from '@/services/campaigns/hook'; // Use useGetCampaignById
import LoadingSpinner from '@/components/ui/Loading'; // Assuming this component exists

export default function CampaignPreviewPage() {
  const params = useParams();
  const { businessId, campaignId } = params; // Extract businessId and campaignId

  // Fetch campaign directly using useGetCampaignById
  const { data: campaign, isLoading, isError } = useGetCampaignById(campaignId as string, businessId as string);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !campaign) {
    return <p className="p-8 text-center text-red-500">Campaign not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CampaignPreview campaign={campaign} />
    </div>
  );
}
