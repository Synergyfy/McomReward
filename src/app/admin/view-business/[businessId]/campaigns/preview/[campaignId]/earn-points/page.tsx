
'use client';

import React from 'react';
import EarnPointsPagePreview from '@/components/dashboard/campaigns/previews/EarnPointsPagePreview';
// import { CampaignFormData } from '@/context/CampaignFormContext'; // No longer needed
import { useParams } from 'next/navigation'; // Import useParams
import { useGetCampaignById } from '@/services/campaigns/hook'; // Import hook
import LoadingSpinner from '@/components/ui/Loading'; // Assuming this component exists

export default function EarnPointsPreviewPage() {
    const params = useParams();
    const { businessId, campaignId } = params;

    const { data: campaign, isLoading, isError } = useGetCampaignById(campaignId as string, businessId as string);

    if (isLoading) return <LoadingSpinner />;
    if (isError || !campaign) return <p className="text-center text-red-500 py-10">Campaign not found.</p>;

  return (
    <EarnPointsPagePreview campaign={campaign} /> // Pass campaign object directly
  );
}
