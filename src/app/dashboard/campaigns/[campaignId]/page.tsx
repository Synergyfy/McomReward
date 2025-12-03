"use client";
import { redirect } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function CampaignPage() {
    const params = useParams();
    const { campaignId } = params;
    redirect(`/dashboard/campaigns/${campaignId}/overview`);
}
