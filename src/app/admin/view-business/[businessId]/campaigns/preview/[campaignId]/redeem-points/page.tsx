
'use client';

import React from 'react';
import RedeemPointsPagePreview from '@/components/dashboard/campaigns/previews/RedeemPointsPagePreview';
import { CampaignFormData } from '@/context/CampaignFormContext'; // Keep for type reference if needed
import { useParams } from 'next/navigation'; // Import useParams
import { useGetCampaignById } from '@/services/campaigns/hook'; // Import hook
import LoadingSpinner from '@/components/ui/Loading'; // Assuming this component exists

export default function RedeemPointsPreviewPage() {
    const params = useParams();
    const { businessId, campaignId } = params;

    const { data: campaign, isLoading, isError } = useGetCampaignById(campaignId as string, businessId as string);

    if (isLoading) return <LoadingSpinner />;
    if (isError || !campaign) return <p className="text-center text-red-500 py-10">Campaign not found.</p>;

  return (
    <RedeemPointsPagePreview campaign={campaign} /> // Pass campaign object directly
  );
}
