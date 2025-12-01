
'use client';

import React from 'react';
import ContactUsPagePreview from '@/components/dashboard/campaigns/previews/ContactUsPagePreview';
// import { CampaignFormData } from '@/context/CampaignFormContext'; // No longer needed
import { useParams } from 'next/navigation'; // Import useParams
import { useGetCampaignById } from '@/services/campaigns/hook'; // Import hook
import LoadingSpinner from '@/components/ui/Loading'; // Assuming this component exists

export default function ContactUsPreviewPage() {
    const params = useParams();
    const { businessId, campaignId } = params;

    const { data: campaign, isLoading, isError } = useGetCampaignById(campaignId as string, businessId as string);

    if (isLoading) return <LoadingSpinner />;
    if (isError || !campaign) return <p className="text-center text-red-500 py-10">Campaign not found.</p>;

  return (
    <ContactUsPagePreview campaign={campaign} /> // Pass campaign object directly
  );
}
